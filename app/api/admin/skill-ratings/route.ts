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

  const { playerId, ratings } = await req.json()
  // ratings: [{ skillId: string, value: number }]

  if (!playerId || !ratings || !Array.isArray(ratings)) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  await prisma.skillRating.createMany({
    data: ratings.map((r: { skillId: string; value: number }) => ({
      playerId,
      skillId: r.skillId,
      value: r.value,
      tenantId: profile.tenantId,
    })),
  })

  return NextResponse.json({ success: true })
}