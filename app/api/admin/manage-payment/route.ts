import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const updatePaymentSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.union([z.string(), z.number()]).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
})

const deletePaymentSchema = z.object({
  paymentId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const body = await req.json()
  const parsed = updatePaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }
  const { paymentId, amount, description, date } = parsed.data

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment || payment.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الدفعة غير موجودة' }, { status: 404 })
  }
const newAmount = amount !== undefined ? Number(amount) : Number(payment.amount)
  if (isNaN(newAmount) || newAmount < 0) {
    return NextResponse.json({ error: 'المبلغ غير صالح' }, { status: 400 })
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      amount: newAmount,
      description: description !== undefined ? description : payment.description,
      date: date ? new Date(date) : payment.date,
    },
  })

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'UPDATE',
    entity: 'Payment',
    entityId: paymentId,
    details: `تعديل مبلغ من ${payment.amount} إلى ${newAmount}`,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const body = await req.json()
  const parsed = deletePaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }
  const { paymentId } = parsed.data

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment || payment.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الدفعة غير موجودة' }, { status: 404 })
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'CANCELLED' },
  })

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'CANCEL',
    entity: 'Payment',
    entityId: paymentId,
    details: `إلغاء دفعة بمبلغ ${payment.amount} جنيه`,
  })

  return NextResponse.json({ success: true })
}