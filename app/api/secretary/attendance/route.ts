import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || (profile.role !== 'SECRETARY' && profile.role !== 'ADMIN' && profile.role !== 'COACH')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { playerId, sportId, date, present, coachNote } = await req.json()

  if (!playerId || !sportId || !date) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

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
    where: {
      playerId,
      sportId,
      date: { gte: startOfDay, lte: endOfDay },
    },
  })

  if (existing) {
    return NextResponse.json({ error: 'تم تسجيل حضور هذا اللاعب في هذه الرياضة اليوم بالفعل' }, { status: 400 })
  }

  const now = new Date()

  const attendance = await prisma.$transaction(async (tx) => {
    if (present) {
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
    }

    return await tx.attendance.create({
      data: {
        tenantId: profile.tenantId,
        playerId,
        sportId,
        date: dateObj,
        present: Boolean(present),
        coachNote: coachNote || null,
        recordedById: user.id,
      },
    })
  })

  return NextResponse.json({ success: true, attendance })
}