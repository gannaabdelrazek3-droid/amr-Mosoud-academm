import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { playerId, sportId, weightKg, date } = await req.json()

  if (!playerId || !sportId || !weightKg) {
    return NextResponse.json({ error: 'برجاء ملء البيانات المطلوبة' }, { status: 400 })
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  const sportCheck = await prisma.sport.findUnique({ where: { id: sportId } })
  if (!sportCheck || sportCheck.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الرياضة غير صالحة' }, { status: 400 })
  }

  const coachSport = await prisma.coachSport.findFirst({
    where: { coachId: profile.id, sportId },
  })
  if (!coachSport) {
    return NextResponse.json({ error: 'هذه الرياضة ليست ضمن رياضاتك' }, { status: 403 })
  }

  await prisma.weightLog.create({
    data: {
      playerId,
      sportId,
      tenantId: profile.tenantId,
      weightKg: Number(weightKg),
      date: date ? new Date(date) : new Date(),
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { weightId } = await req.json()

  const weight = await prisma.weightLog.findUnique({ where: { id: weightId } })
  if (!weight || weight.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 })
  }

  await prisma.weightLog.delete({ where: { id: weightId } })

  return NextResponse.json({ success: true })
}