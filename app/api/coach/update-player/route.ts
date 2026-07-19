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

  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const { fullName, phone, birthDate, sportsBackground, sportIds } = await req.json()

  if (!fullName) {
    return NextResponse.json({ error: 'اسم اللاعب مطلوب' }, { status: 400 })
  }

  const player = await prisma.player.create({
    data: {
      fullName,
      phone: phone || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      sportsBackground: sportsBackground || null,
      tenantId: profile.tenantId,
      joinDate: new Date(),
    },
  })

  if (sportIds && sportIds.length > 0) {
    await prisma.playerSport.createMany({
      data: sportIds.map((sportId: string) => ({
        playerId: player.id,
        sportId,
      })),
    })
  }

  return NextResponse.json({ success: true, player })
}