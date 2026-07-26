import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { paymentId, amount, description, date } = await req.json()

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment || payment.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الدفعة غير موجودة' }, { status: 404 })
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      amount: amount !== undefined ? Number(amount) : payment.amount,
      description: description !== undefined ? description : payment.description,
      date: date ? new Date(date) : payment.date,
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

  const { paymentId } = await req.json()

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment || payment.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الدفعة غير موجودة' }, { status: 404 })
  }

  await prisma.payment.delete({ where: { id: paymentId } })

  return NextResponse.json({ success: true })
}