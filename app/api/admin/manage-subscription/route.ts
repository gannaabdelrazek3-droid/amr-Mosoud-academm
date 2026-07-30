import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const manageSchema = z.object({
  subscriptionId: z.string().min(1),
  action: z.enum(['toggle-freeze', 'delete']),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = manageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { subscriptionId, action } = parsed.data

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
      await logAudit({
        tenantId: profile.tenantId,
        userId: user.id,
        userRole: profile.role,
        action: 'UPDATE',
        entity: 'Subscription',
        entityId: subscriptionId,
        details: subscription.isFrozen ? 'إلغاء تجميد اشتراك' : 'تجميد اشتراك',
      })
    } else {
      await prisma.subscription.delete({ where: { id: subscriptionId } })
      await logAudit({
        tenantId: profile.tenantId,
        userId: user.id,
        userRole: profile.role,
        action: 'DELETE',
        entity: 'Subscription',
        entityId: subscriptionId,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}