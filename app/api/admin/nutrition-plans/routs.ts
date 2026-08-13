import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COACH')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const playerId = req.nextUrl.searchParams.get('playerId')
  if (!playerId) return NextResponse.json({ error: 'معرف اللاعب مطلوب' }, { status: 400 })

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  if (profile.role === 'COACH' && player.coachId !== profile.id) return NextResponse.json({ error: 'اللاعب ليس ضمن فريقك' }, { status: 403 })

  const plans = await prisma.playerNutritionPlan.findMany({
    where: { playerId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ plans })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COACH')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { playerId, title, content } = await req.json()
  if (!playerId || !title || !content) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  if (profile.role === 'COACH' && player.coachId !== profile.id) return NextResponse.json({ error: 'اللاعب ليس ضمن فريقك' }, { status: 403 })

  const plan = await prisma.playerNutritionPlan.create({
    data: { tenantId: profile.tenantId, playerId, title, content, createdByRole: profile.role },
  })

  return NextResponse.json({ success: true, plan })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COACH')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

  const plan = await prisma.playerNutritionPlan.findUnique({ where: { id }, include: { player: true } })
  if (!plan || plan.tenantId !== profile.tenantId) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
  if (profile.role === 'COACH' && plan.player.coachId !== profile.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  await prisma.playerNutritionPlan.delete({ where: { id } })

  return NextResponse.json({ success: true })
}