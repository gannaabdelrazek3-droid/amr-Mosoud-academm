import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const players = await prisma.player.findMany({
    where: { tenantId: profile.tenantId },
    include: { subscriptions: { orderBy: { endDate: 'desc' }, take: 1 } },
    orderBy: { fullName: 'asc' },
  })

  const now = new Date()
  const result = players
    .filter((p) => p.subscriptions.length > 0)
    .map((p) => {
      const sub = p.subscriptions[0]
      const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      let status: 'active' | 'expiring' | 'expired' = 'active'
      if (daysLeft < 0) status = 'expired'
      else if (daysLeft <= 7) status = 'expiring'

      return {
        playerId: p.id,
        fullName: p.fullName,
        remaining: sub.remaining,
        totalSessions: sub.totalSessions,
        endDate: sub.endDate,
        status,
      }
    })
    .sort((a, b) => {
      const order = { expired: 0, expiring: 1, active: 2 }
      return order[a.status] - order[b.status]
    })

  return NextResponse.json({ subscriptions: result })
}