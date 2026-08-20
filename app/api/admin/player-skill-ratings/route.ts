import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح - لم يتم تسجيل الدخول' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COACH')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const playerId = req.nextUrl.searchParams.get('playerId')
    if (!playerId) return NextResponse.json({ error: 'معرف اللاعب مطلوب' }, { status: 400 })

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
    }
    if (profile.role === 'COACH' && player.coachId !== profile.id) {
      return NextResponse.json({ error: 'اللاعب ليس ضمن فريقك' }, { status: 403 })
    }

    const ratings = await prisma.skillRating.findMany({
      where: { playerId },
      include: { skill: { include: { sport: true } } },
      orderBy: { date: 'desc' },
    })

    const latestMap = new Map<string, { skillId: string; skillName: string; sportName: string; value: number; date: string }>()
    ratings.forEach((r) => {
      if (!latestMap.has(r.skillId)) {
        latestMap.set(r.skillId, {
          skillId: r.skillId,
          skillName: r.skill.name,
          sportName: r.skill.sport.name,
          value: r.value,
          date: r.date.toISOString(),
        })
      }
    })

    return NextResponse.json({ ratings: Array.from(latestMap.values()) })
  } catch (err) {
    console.error('player-skill-ratings GET error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة في الخادم أثناء جلب المهارات' }, { status: 500 })
  }
}