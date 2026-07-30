import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const attendanceSchema = z.object({
  playerId: z.string().min(1),
  sportId: z.string().min(1),
  date: z.string().min(1),
  present: z.boolean(),
  coachNote: z.string().optional(),
})

const deleteSchema = z.object({
  attendanceId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = attendanceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { playerId, sportId, date, present, coachNote } = parsed.data

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
    }

    const sportCheck = await prisma.sport.findUnique({ where: { id: sportId } })
    if (!sportCheck || sportCheck.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'الرياضة غير صالحة' }, { status: 400 })
    }

    const dateObj = new Date(date)
    const startOfDay = new Date(dateObj)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dateObj)
    endOfDay.setHours(23, 59, 59, 999)

    const existing = await prisma.attendance.findFirst({
      where: { playerId, sportId, date: { gte: startOfDay, lte: endOfDay } },
    })
    if (existing) {
      return NextResponse.json({ error: 'تم تسجيل حضور هذا اللاعب في هذه الرياضة اليوم بالفعل' }, { status: 400 })
    }

    await prisma.attendance.create({
      data: {
        playerId,
        sportId,
        tenantId: profile.tenantId,
        date: dateObj,
        present,
        coachNote: coachNote || null,
      },
    })

    if (present) {
      const now = new Date()
      await prisma.$transaction(async (tx) => {
        const activeSub = await tx.subscription.findFirst({
          where: { playerId, isFrozen: false, remaining: { gt: 0 }, endDate: { gte: now } },
          orderBy: { endDate: 'desc' },
        })
        if (activeSub) {
          await tx.subscription.updateMany({
            where: { id: activeSub.id, remaining: { gt: 0 } },
            data: { remaining: { decrement: 1 } },
          })
        }
      })
    }

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Attendance',
      entityId: playerId,
      details: `تسجيل حضور ${present ? '(حضر)' : '(غاب)'} للاعب ${player.fullName}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { attendanceId } = parsed.data

    const attendance = await prisma.attendance.findUnique({ where: { id: attendanceId } })
    if (!attendance || attendance.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 })
    }

    await prisma.attendance.delete({ where: { id: attendanceId } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'Attendance',
      entityId: attendanceId,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}