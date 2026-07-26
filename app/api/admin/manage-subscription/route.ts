import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { subscriptionId, action } = await req.json()

  const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } })
  if (!subscription || subscription.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الاشتراك غير موجود' }, { status: 404 })
  }

  if (action === 'toggle-freeze') {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        isFrozen: !subscription.isFrozen,
        frozenAt: !subscription.isFrozen ? new Date() : null,
      },
    })
  } else if (action === 'delete') {
    await prisma.subscription.delete({ where: { id: subscriptionId } })
  } else {
    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}