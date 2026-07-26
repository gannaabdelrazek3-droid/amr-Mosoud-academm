import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const playerId = req.nextUrl.searchParams.get('playerId')
  if (!playerId) return NextResponse.json({ error: 'معرّف اللاعب مفقود' }, { status: 400 })

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      subscriptions: { orderBy: { endDate: 'desc' } },
      sports: { include: { sport: true } },
      skillRatings: { include: { skill: true }, orderBy: { date: 'desc' }, take: 20 },
      tournaments: { orderBy: { year: 'desc' } },
      attendances: { include: { sport: true }, orderBy: { date: 'desc' }, take: 20 },
      weightLogs: { include: { sport: true }, orderBy: { date: 'desc' }, take: 20 },
    },
  })

  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  const allSports = await prisma.sport.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { name: 'asc' },
  })

  const coaches = await prisma.profile.findMany({
    where: { tenantId: profile.tenantId, role: 'COACH' },
    select: { id: true, fullName: true },
  })

  const playerSportIds = player.sports.map((ps) => ps.sportId)

  const skills = await prisma.skill.findMany({
    where: { tenantId: profile.tenantId, sportId: { in: playerSportIds } },
    include: { sport: true },
  })

  const latestRatings = new Map<string, number>()
  for (const r of player.skillRatings) {
    if (!latestRatings.has(r.skillId)) latestRatings.set(r.skillId, r.value)
  }

  return NextResponse.json({
    player: {
      id: player.id,
      fullName: player.fullName,
      phone: player.phone,
      birthDate: player.birthDate,
      sportsBackground: player.sportsBackground,
      email: player.email,
      medicalCheckExpiry: player.medicalCheckExpiry,
      joinDate: player.joinDate,
      coachId: player.coachId,
      subscriptions: player.subscriptions,
      sports: player.sports,
      tournaments: player.tournaments,
      recentSkillRatings: player.skillRatings.map((r) => ({
        id: r.id,
        skillName: r.skill.name,
        value: r.value,
        date: r.date,
      })),
      attendances: player.attendances.map((a) => ({
        id: a.id,
        sportName: a.sport.name,
        date: a.date,
        present: a.present,
        coachNote: a.coachNote,
      })),
      weightLogs: player.weightLogs.map((w) => ({
        id: w.id,
        sportName: w.sport.name,
        weightKg: w.weightKg,
        date: w.date,
      })),
    },
    allSports,
    coaches,
    playerSportIds,
    skills: skills.map((sk) => ({ id: sk.id, name: sk.name, sportName: sk.sport.name })),
    skillRatings: Object.fromEntries(latestRatings),
  })
}