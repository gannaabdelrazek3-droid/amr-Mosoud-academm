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

  if (!profile || profile.role !== 'COACH') {
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
    },
  })

  if (!player || player.coachId !== profile.id) {
    return NextResponse.json({ error: 'اللاعب ده مش بتاعك' }, { status: 403 })
  }

  return NextResponse.json({ player })
}