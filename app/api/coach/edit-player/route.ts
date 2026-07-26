import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const body = await req.json()
  const { playerId, phone, birthDate, sportsBackground, medicalCheckExpiry, newSubscription, skillRatings } = body

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.coachId !== profile.id) {
    return NextResponse.json({ error: 'اللاعب غير موجود أو ليس ضمن فريقك' }, { status: 404 })
  }

  await prisma.player.update({
    where: { id: playerId },
    data: {
      phone: phone || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      sportsBackground: sportsBackground || null,
      medicalCheckExpiry: medicalCheckExpiry ? new Date(medicalCheckExpiry) : null,
    },
  })

  if (newSubscription && newSubscription.totalSessions && newSubscription.endDate) {
    await prisma.subscription.create({
      data: {
        playerId,
        tenantId: profile.tenantId,
        totalSessions: Number(newSubscription.totalSessions),
        remaining: Number(newSubscription.totalSessions),
        endDate: new Date(newSubscription.endDate),
      },
    })
  }

  if (skillRatings && typeof skillRatings === 'object') {
    for (const [skillId, value] of Object.entries(skillRatings)) {
      if (value === '' || value === null || value === undefined) continue
      await prisma.skillRating.create({
        data: { playerId, skillId, tenantId: profile.tenantId, value: Number(value) },
      })
    }
  }

  return NextResponse.json({ success: true })
}