import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const attendanceSchema = z.object({
  playerId: z.string().min(1),
  sportId: z.string().min(1),
  date: z.string().min(1),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const players = await prisma.player.findMany({
      where: { tenantId: profile.tenantId },
      include: {
        sports: { include: { sport: true } },
        coach: true,
        attendances: { orderBy: { date: 'desc' }, take: 1 },
      },
      orderBy: { fullName: 'asc' },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = players.map((p) => {
      const lastAttendance = p.attendances[0]
      const markedToday = lastAttendance && new Date(lastAttendance.date).setHours(0, 0, 0, 0) === today.getTime()
      return {
        id: p.id,
        fullName: p.fullName,
        sports: p.sports.map((ps) => ({ id: ps.sport.id, name: ps.sport.name })),
        coachName: p.coach?.fullName || 'بدون مدرب',
        markedToday: !!markedToday,
      }
    })

    const allSports = await prisma.sport.findMany({
      where: { tenantId: profile.tenantId },
      orderBy: { name: 'asc' },
    })

    const allCoaches = await prisma.profile.findMany({
      where: { tenantId: profile.tenantId, role: { in: ['COACH', 'ADMIN'] } },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    })

    return NextResponse.json({ players: result, allSports, allCoaches })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = attendanceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { playerId, sportId, date } = parsed.data

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
    }

    const sportCheck = await prisma.sport.findUnique({ where: { id: sportId } })
    if (!sportCheck || sportCheck.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'الرياضة غير صالحة' }, { status: 400 })
    }

    // معالجة آمنة لتاريخ الواجهة الأمامية بغض النظر عن صيغته (سواء بـ / أو -)
    let targetDate: Date
    if (date.includes('/')) {
      const parts = date.split('/')
      if (parts[2]?.length === 4) {
        targetDate = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}T12:00:00.000Z`)
      } else {
        targetDate = new Date(`${date}T12:00:00.000Z`)
      }
    } else {
      targetDate = new Date(`${date}T12:00:00.000Z`)
    }

    if (isNaN(targetDate.getTime())) {
      targetDate = new Date()
    }

    const startOfDay = new Date(targetDate)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setUTCHours(23, 59, 59, 999)

    // التحقق من وجود السجل في نفس اليوم المحدد فقط بدقة
    const existing = await prisma.attendance.findFirst({
      where: { playerId, sportId, date: { gte: startOfDay, lte: endOfDay } },
    })
    if (existing) {
      return NextResponse.json({ error: 'تم تسجيل حضور هذا اللاعب في هذا اليوم بالفعل' }, { status: 400 })
    }

    // حفظ الحضور بالتاريخ الصحيح تماماً
    await prisma.attendance.create({
      data: {
        playerId,
        sportId,
        tenantId: profile.tenantId,
        date: targetDate,
        present: true,
      },
    })

    await prisma.$transaction(async (tx) => {
      const activeSub = await tx.subscription.findFirst({
        where: { playerId, isFrozen: false, remaining: { gt: 0 }, endDate: { gte: targetDate } },
        orderBy: { endDate: 'desc' },
      })
      if (activeSub) {
        await tx.subscription.updateMany({
          where: { id: activeSub.id, remaining: { gt: 0 } },
          data: { remaining: { decrement: 1 } },
        })
      }
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Attendance',
      entityId: playerId,
      details: `تسجيل حضور للاعب ${player.fullName}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}