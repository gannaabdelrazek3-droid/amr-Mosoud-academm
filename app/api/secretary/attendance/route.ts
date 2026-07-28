import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const players = await prisma.player.findMany({
    where: { tenantId: profile.tenantId },
    include: {
      sports: { include: { sport: true } },
      attendances: { orderBy: { date: 'desc' }, take: 1 },
    },
    orderBy: { fullName: 'asc' },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = players.map((p) => {
    const lastAttendance = p.attendances[0]
    const markedToday = lastAttendance && new Date(lastAttendance.date).setHours(0, 0, 0, 0) === today.getTime()
    return {
      id: p.id,
      fullName: p.fullName,
      sports: p.sports.map((ps) => ({ id: ps.sport.id, name: ps.sport.name })),
      markedToday: !!markedToday,
    }
  })

  return NextResponse.json({ players: result })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { playerId, sportId } = await req.json()

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  await prisma.attendance.create({
    data: {
      playerId,
      sportId,
      tenantId: profile.tenantId,
      date: new Date(),
      present: true,
    },
  })

  const activeSub = await prisma.subscription.findFirst({
    where: { playerId, isFrozen: false, remaining: { gt: 0 } },
    orderBy: { endDate: 'desc' },
  })
  if (activeSub) {
    await prisma.subscription.update({
      where: { id: activeSub.id },
      data: { remaining: { decrement: 1 } },
    })
  }

  return NextResponse.json({ success: true })
}