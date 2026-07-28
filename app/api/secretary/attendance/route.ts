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
      coach: true,
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
      coachName: p.coach?.fullName || 'بدون مدرب',
      markedToday: !!markedToday,
    }
  })

  const allSports = await prisma.sport.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { name: 'asc' },
  })

  const allCoaches = await prisma.profile.findMany({
    where: { tenantId: profile.tenantId, role: { in: ['COACH', 'ADMIN'] } },
    select: { id: true, fullName: true },
    orderBy: { fullName: 'asc' },
  })

  return NextResponse.json({ players: result, allSports, allCoaches })
}