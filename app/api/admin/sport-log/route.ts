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

  const { playerId, sportId, present, rating, weight, note } = await req.json()

  if (!playerId || !sportId) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  await prisma.attendance.create({
    data: {
      playerId,
      sportId,
      tenantId: profile.tenantId,
      present: present ?? true,
      coachNote: note || null,
    },
  })

  if (rating) {
    await prisma.playerProgress.create({
      data: {
        playerId,
        sportId,
        tenantId: profile.tenantId,
        skillRating: parseInt(rating),
        coachNote: note || null,
      },
    })
  }

  if (weight) {
    await prisma.weightLog.create({
      data: {
        playerId,
        sportId,
        tenantId: profile.tenantId,
        weightKg: parseFloat(weight),
      },
    })
  }

  return NextResponse.json({ success: true })
}