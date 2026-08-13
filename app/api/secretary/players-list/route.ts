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
    include: { sports: { include: { sport: true } } },
    orderBy: { fullName: 'asc' },
  })

  const result = players.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    sports: p.sports.map((ps) => ({ id: ps.sport.id, name: ps.sport.name })),
  }))

  return NextResponse.json({ players: result })
}