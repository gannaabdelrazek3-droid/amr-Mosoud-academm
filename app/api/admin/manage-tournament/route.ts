import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { playerId, name, year, result } = await req.json()

  if (!playerId || !name || !year) {
    return NextResponse.json({ error: 'برجاء ملء البيانات المطلوبة' }, { status: 400 })
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  await prisma.tournament.create({
    data: {
      playerId,
      tenantId: profile.tenantId,
      name,
      year: Number(year),
      result: result || null,
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { tournamentId } = await req.json()

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament || tournament.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'البطولة غير موجودة' }, { status: 404 })
  }

  await prisma.tournament.delete({ where: { id: tournamentId } })

  return NextResponse.json({ success: true })
}