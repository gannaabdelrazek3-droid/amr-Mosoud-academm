import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
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

  const playerId = req.nextUrl.searchParams.get('playerId')

  if (!playerId) {
    return NextResponse.json({ error: 'playerId مطلوب' }, { status: 400 })
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      subscriptions: { orderBy: { endDate: 'desc' }, take: 1 },
      sports: { include: { sport: true } },
      payments: { orderBy: { date: 'desc' }, take: 5 },
    },
  })

  if (!player) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ player })
}