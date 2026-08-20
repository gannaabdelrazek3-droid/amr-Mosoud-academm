import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { toDateKey, dateKeyToUtcNoon } from '@/lib/datekey'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const dateParam = req.nextUrl.searchParams.get('date')
    if (!dateParam) return NextResponse.json({ error: 'التاريخ مطلوب' }, { status: 400 })

    const dateKey = toDateKey(dateParam)
    const dayOfWeek = dateKeyToUtcNoon(dateKey).getUTCDay()

    const [schedules, todayRecords, allPlayers] = await Promise.all([
      prisma.coachSchedule.findMany({
        where: { tenantId: profile.tenantId, dayOfWeek },
        include: { coach: { select: { fullName: true } }, sport: { select: { name: true } } },
        orderBy: [{ time: 'asc' }],
      }),
      prisma.attendance.findMany({
        where: { tenantId: profile.tenantId, dateKey },
        select: { playerId: true, sportId: true, present: true },
      }),
      prisma.player.findMany({
        where: { tenantId: profile.tenantId },
        include: { sports: { select: { sportId: true } } },
      }),
    ])

    const groups = schedules.map((sch) => {
      const groupPlayers = allPlayers
        .filter((p) => p.coachId === sch.coachId && p.sports.some((ps) => ps.sportId === sch.sportId))
        .map((p) => {
          const rec = todayRecords.find((r) => r.playerId === p.id && r.sportId === sch.sportId)
          return { id: p.id, fullName: p.fullName, alreadyMarked: rec ? (rec.present ? 'PRESENT' : 'ABSENT') : null }
        })

      return {
        scheduleId: sch.id,
        coachId: sch.coachId,
        coachName: sch.coach.fullName,
        sportId: sch.sportId,
        sportName: sch.sport.name,
        groupName: sch.groupName,
        time: sch.time,
        players: groupPlayers,
      }
    })

    const groupedPlayerIds = new Set(groups.flatMap((g) => g.players.map((p) => p.id)))
    const ungroupedPlayers = allPlayers
      .filter((p) => !groupedPlayerIds.has(p.id))
      .map((p) => ({ id: p.id, fullName: p.fullName, sportIds: p.sports.map((s) => s.sportId) }))

    return NextResponse.json({ groups, ungroupedPlayers, dayOfWeek, dateKey })
  } catch (err) {
    console.error('attendance-groups error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة في الخادم أثناء جلب المجموعات' }, { status: 500 })
  }
}