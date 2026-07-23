import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile || profile.role !== 'COACH') {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const players = await prisma.player.findMany({
    where: { coachId: profile.id },
    include: {
      subscriptions: {
        orderBy: { endDate: 'desc' },
        take: 1,
      },
    },
    orderBy: { fullName: 'asc' },
  })

  const result = players.map((p) => {
    const sub = p.subscriptions[0]
    const daysLeft = sub
      ? Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return {
      id: p.id,
      fullName: p.fullName,
      remaining: sub ? sub.remaining : null,
      totalSessions: sub ? sub.totalSessions : null,
      endDate: sub ? sub.endDate : null,
      daysLeft,
    }
  })

  return NextResponse.json({ players: result })
}