import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const records = await prisma.attendance.findMany({
    where: { tenantId: profile.tenantId },
    include: { player: { select: { fullName: true } }, sport: { select: { name: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })

  const recorderIds = [...new Set(records.map((r) => r.recordedById).filter(Boolean))] as string[]
  const recorders = await prisma.profile.findMany({
    where: { id: { in: recorderIds } },
    select: { id: true, fullName: true, role: true },
  })
  const recorderMap = new Map(recorders.map((r) => [r.id, r]))

  const result = records.map((r) => ({
    id: r.id,
    playerName: r.player.fullName,
    sportName: r.sport.name,
    date: r.date,
    present: r.present,
    coachNote: r.coachNote,
    recordedBy: r.recordedById ? recorderMap.get(r.recordedById) || null : null,
  }))

  return NextResponse.json({ records: result })
}