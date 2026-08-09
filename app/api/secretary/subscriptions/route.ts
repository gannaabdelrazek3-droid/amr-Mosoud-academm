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
    .filter((p) => p.subscriptions.length > 0 || p.pendingRenewalTotalAmount !== null)
    .map((p) => {
      const sub = p.subscriptions[0]
      const hasPending = p.pendingRenewalTotalAmount !== null

      let status: 'active' | 'expiring' | 'expired' | 'pending' = 'active'
      let daysLeft: number | null = null

      if (sub) {
        daysLeft = Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysLeft < 0) status = 'expired'
        else if (daysLeft <= 7) status = 'expiring'
      } else {
        status = 'expired'
      }

      if (hasPending) status = 'pending'

      return {
        playerId: p.id,
        fullName: p.fullName,
        remaining: sub?.remaining ?? 0,
        totalSessions: sub?.totalSessions ?? 0,
        endDate: sub?.endDate ?? null,
        status,
        hasPendingRenewal: hasPending,
        pendingTotal: hasPending ? Number(p.pendingRenewalTotalAmount) : 0,
        pendingPaid: hasPending ? Number(p.pendingRenewalPaidAmount) : 0,
        pendingRemaining: hasPending ? Number(p.pendingRenewalTotalAmount) - Number(p.pendingRenewalPaidAmount) : 0,
      }
    })
    .sort((a, b) => {
      const order = { pending: 0, expired: 1, expiring: 2, active: 3 }
      return order[a.status] - order[b.status]
    })

  return NextResponse.json({ subscriptions: result })
}