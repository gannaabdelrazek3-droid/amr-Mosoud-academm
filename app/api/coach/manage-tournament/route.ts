import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { playerId, name, year, result } = await req.json()

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.coachId !== profile.id) {
    return NextResponse.json({ error: 'اللاعب غير موجود أو ليس ضمن فريقك' }, { status: 404 })
  }

  await prisma.tournament.create({
    data: { playerId, tenantId: profile.tenantId, name, year: Number(year), result: result || null },
  })

  return NextResponse.json({ success: true })
}