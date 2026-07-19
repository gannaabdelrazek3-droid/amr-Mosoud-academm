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

  if (!profile) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const { playerId } = await req.json()

  const subscription = await prisma.subscription.findFirst({
    where: { playerId, tenantId: profile.tenantId },
    orderBy: { endDate: 'desc' },
  })

  if (!subscription) {
    return NextResponse.json({ error: 'مفيش اشتراك نشط لهذا اللاعب' }, { status: 404 })
  }

  if (!subscription.isFrozen) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
      },
    })
  } else {
    const frozenDays = Math.ceil(
      (Date.now() - new Date(subscription.frozenAt!).getTime()) / (1000 * 60 * 60 * 24)
    )
    const newEndDate = new Date(subscription.endDate)
    newEndDate.setDate(newEndDate.getDate() + frozenDays)

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        isFrozen: false,
        frozenAt: null,
        endDate: newEndDate,
      },
    })
  }

  return NextResponse.json({ success: true, isFrozen: !subscription.isFrozen })
}