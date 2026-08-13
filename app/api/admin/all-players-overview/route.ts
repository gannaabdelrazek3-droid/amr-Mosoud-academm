import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const players = await prisma.player.findMany({
    where: { tenantId: profile.tenantId },
    include: {
      coach: { select: { fullName: true } },
      subscriptions: { orderBy: { endDate: 'desc' }, take: 1 },
      attendances: { orderBy: { date: 'desc' }, take: 5 },
      sports: { include: { sport: true } },
    },
    orderBy: { fullName: 'asc' },
  })

  const result = players.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    coachName: p.coach?.fullName || 'بدون مدرب',
    sports: p.sports.map((ps) => ps.sport.name),
    subscription: p.subscriptions[0]
      ? {
          remaining: p.subscriptions[0].remaining,
          totalSessions: p.subscriptions[0].totalSessions,
          endDate: p.subscriptions[0].endDate,
        }
      : null,
    recentAttendance: p.attendances.map((a) => ({ date: a.date, present: a.present })),
  }))

  return NextResponse.json({ players: result })
}