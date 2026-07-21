import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const player = await prisma.player.findUnique({
    where: { userId: user.id },
  })

  if (!player) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const ratings = await prisma.skillRating.findMany({
    where: { playerId: player.id },
    include: { skill: true },
    orderBy: { date: 'desc' },
  })

  const latestBySkill = new Map<string, { name: string; value: number }>()
  for (const r of ratings) {
    if (!latestBySkill.has(r.skillId)) {
      latestBySkill.set(r.skillId, { name: r.skill.name, value: r.value })
    }
  }

  const skills = Array.from(latestBySkill.values())

  return NextResponse.json({ skills })
}