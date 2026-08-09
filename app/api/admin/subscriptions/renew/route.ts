import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })

  const { playerId, totalAmount, paidAmountNow, totalSessions, durationDays } = await req.json()

  if (!playerId || paidAmountNow === undefined) {
    return NextResponse.json({ error: 'بيانات غير كافية' }, { status: 400 })
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  const parsedPaidNow = parseFloat(paidAmountNow)
  if (isNaN(parsedPaidNow) || parsedPaidNow < 0) {
    return NextResponse.json({ error: 'قيمة المبلغ غير صحيحة' }, { status: 400 })
  }

  const hasPending = player.pendingRenewalTotalAmount !== null

  let effectiveTotal: number
  let effectiveSessions: number
  let effectiveDuration: number
  let paidSoFar: number

  if (hasPending) {
    // في نص عملية تجديد سابقة - نضيف الدفعة الجديدة على المتبقي
    effectiveTotal = Number(player.pendingRenewalTotalAmount)
    effectiveSessions = player.pendingRenewalSessions as number
    effectiveDuration = player.pendingRenewalDurationDays as number
    paidSoFar = Number(player.pendingRenewalPaidAmount) + parsedPaidNow
  } else {
    // تجديد جديد من الصفر
    if (totalAmount === undefined || !totalSessions || !durationDays) {
      return NextResponse.json({ error: 'يجب إدخال قيمة الاشتراك وعدد الحصص والمدة عند بدء تجديد جديد' }, { status: 400 })
    }
    effectiveTotal = parseFloat(totalAmount)
    effectiveSessions = parseInt(totalSessions)
    effectiveDuration = parseInt(durationDays)
    paidSoFar = parsedPaidNow

    if (isNaN(effectiveTotal) || effectiveTotal <= 0) {
      return NextResponse.json({ error: 'قيمة الاشتراك غير صحيحة' }, { status: 400 })
    }
  }

  const remainingAmount = Math.max(0, effectiveTotal - paidSoFar)
  const isFullyPaid = remainingAmount <= 0

  let createdSubscriptionId: string | null = null

  if (isFullyPaid) {
    // اكتمل الدفع بالكامل الآن -> ننشئ الاشتراك الفعلي فعليًا
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + effectiveDuration)

    const subscription = await prisma.subscription.create({
      data: {
        playerId,
        tenantId: profile.tenantId,
        totalSessions: effectiveSessions,
        remaining: effectiveSessions,
        startDate,
        endDate,
        totalAmount: effectiveTotal,
        paidAmount: effectiveTotal,
        remainingAmount: 0,
        paymentStatus: 'PAID',
      },
    })
    createdSubscriptionId = subscription.id

    // تصفير التجديد المعلّق بعد التفعيل
    await prisma.player.update({
      where: { id: playerId },
      data: {
        pendingRenewalTotalAmount: null,
        pendingRenewalPaidAmount: null,
        pendingRenewalSessions: null,
        pendingRenewalDurationDays: null,
      },
    })
  } else {
    // لسه مدفوع جزئي - نحدّث المعلّق فقط، من غير ما نفعّل أي اشتراك جديد
    await prisma.player.update({
      where: { id: playerId },
      data: {
        pendingRenewalTotalAmount: effectiveTotal,
        pendingRenewalPaidAmount: paidSoFar,
        pendingRenewalSessions: effectiveSessions,
        pendingRenewalDurationDays: effectiveDuration,
      },
    })
  }

  if (parsedPaidNow > 0) {
    await prisma.payment.create({
      data: {
        tenantId: profile.tenantId,
        playerId,
        subscriptionId: createdSubscriptionId,
        amount: parsedPaidNow,
        source: 'SUBSCRIPTION',
        description: isFullyPaid
          ? 'دفعة أخيرة أكملت التجديد - تم تفعيل الاشتراك'
          : `دفعة جزئية على تجديد الاشتراك - متبقي ${remainingAmount.toFixed(2)} جنيه`,
      },
    })
  }

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: isFullyPaid ? 'CREATE' : 'UPDATE',
    entity: 'Subscription',
    entityId: createdSubscriptionId || playerId,
    details: isFullyPaid
      ? `اكتمل تجديد اشتراك اللاعب ${player.fullName} وتم تفعيله`
      : `دفعة جزئية لتجديد اشتراك اللاعب ${player.fullName} - متبقي ${remainingAmount.toFixed(2)} جنيه`,
  })

  return NextResponse.json({
    success: true,
    activated: isFullyPaid,
    remainingAmount,
    totalAmount: effectiveTotal,
    paidSoFar,
  })
}