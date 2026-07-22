import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile || profile.role !== 'COACH') {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const { playerId, amount, totalSessions, durationDays } = await req.json()

  if (!playerId || !amount || !totalSessions || !durationDays) {
    return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 })
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } })

  if (!player || player.coachId !== profile.id) {
    return NextResponse.json({ error: 'اللاعب ده مش بتاعك' }, { status: 403 })
  }

  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + parseInt(durationDays))

  const subscription = await prisma.subscription.create({
    data: {
      playerId,
      tenantId: profile.tenantId,
      totalSessions: parseInt(totalSessions),
      remaining: parseInt(totalSessions),
      startDate,
      endDate,
    },
  })

  await prisma.payment.create({
    data: {
      tenantId: profile.tenantId,
      playerId,
      subscriptionId: subscription.id,
      amount: parseFloat(amount),
      source: 'SUBSCRIPTION',
      description: 'تجديد اشتراك شهري (بواسطة المدرب)',
    },
  })

  return NextResponse.json({ success: true, subscription })
}