import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SECRETARY')) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const { subscriptionId, isStopped } = await req.json()
  if (!subscriptionId || typeof isStopped !== 'boolean') {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId }, include: { player: true } })
  if (!sub || sub.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الاشتراك غير موجود' }, { status: 404 })
  }

  await prisma.subscription.update({ where: { id: subscriptionId }, data: { isStopped } })

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'UPDATE',
    entity: 'Subscription',
    entityId: subscriptionId,
    details: `${isStopped ? 'إيقاف' : 'تفعيل'} التجديد التلقائي لاشتراك ${sub.player.fullName}`,
  })

  return NextResponse.json({ success: true })
}