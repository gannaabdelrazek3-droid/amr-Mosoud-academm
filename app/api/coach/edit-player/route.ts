import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
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

  const { playerId, fullName, phone, birthDate, sportsBackground } = await req.json()

  if (!playerId || !fullName) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } })

  if (!player || player.coachId !== profile.id) {
    return NextResponse.json({ error: 'اللاعب ده مش بتاعك' }, { status: 403 })
  }

  await prisma.player.update({
    where: { id: playerId },
    data: {
      fullName,
      phone: phone || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      sportsBackground: sportsBackground || null,
    },
  })

  return NextResponse.json({ success: true })
}