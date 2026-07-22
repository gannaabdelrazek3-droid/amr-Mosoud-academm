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

  const query = req.nextUrl.searchParams.get('q') || ''

  if (!query.trim()) {
    return NextResponse.json({ players: [] })
  }

  const players = await prisma.player.findMany({
    where: {
      coachId: profile.id,
      fullName: { contains: query, mode: 'insensitive' },
    },
    take: 10,
  })

  return NextResponse.json({ players })
}