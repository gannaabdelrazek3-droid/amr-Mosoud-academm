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

  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const players = await prisma.player.findMany({
    where: { tenantId: profile.tenantId },
    include: {
      subscriptions: {
        orderBy: { endDate: 'desc' },
        take: 1,
      },
    },
    orderBy: { fullName: 'asc' },
  })

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  const duePlayers = players
    .filter((p) => {
      const latest = p.subscriptions[0]
      if (!latest) return true // لسه معملوش اشتراك خالص
      return new Date(latest.endDate) <= nextWeek // خلص أو قرب يخلص
    })
    .map((p) => {
      const latest = p.subscriptions[0]
      return {
        id: p.id,
        fullName: p.fullName,
        lastEndDate: latest ? latest.endDate : null,
        lastRemaining: latest ? latest.remaining : null,
      }
    })

  return NextResponse.json({ players: duePlayers })
}