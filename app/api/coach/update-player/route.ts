import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const { playerId, weight, rating, present, note } = await req.json()

  if (weight) {
    await prisma.weightLog.create({
      data: {
        playerId,
        tenantId: profile.tenantId,
        weightKg: weight,
      },
    })
  }

  await prisma.playerProgress.create({
    data: {
      playerId,
      tenantId: profile.tenantId,
      skillRating: rating,
      coachNote: note || null,
    },
  })

  await prisma.attendance.create({
    data: {
      playerId,
      tenantId: profile.tenantId,
      present,
      coachNote: note || null,
    },
  })

  return NextResponse.json({ success: true })
}