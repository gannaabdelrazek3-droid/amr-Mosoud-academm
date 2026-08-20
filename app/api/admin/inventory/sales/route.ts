import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })

  const { saleId } = await req.json()
  if (!saleId) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

  const sale = await prisma.productSale.findUnique({ where: { id: saleId }, include: { product: true } })
  if (!sale || sale.tenantId !== profile.tenantId) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })

  const remaining = Number(sale.remainingAmount)
  if (remaining <= 0) return NextResponse.json({ error: 'لا يوجد مبلغ متبقي' }, { status: 400 })

  const productName = sale.product?.name ?? 'منتج محذوف'

  await prisma.payment.create({
    data: {
      tenantId: profile.tenantId,
      amount: remaining,
      source: 'PRODUCT_SALE',
      description: `تحصيل باقي ثمن ${productName}${sale.buyerName ? ` - ${sale.buyerName}` : ''}`,
    },
  })

  await prisma.productSale.update({
    where: { id: saleId },
    data: { paidAmount: sale.totalAmount ?? 0, remainingAmount: 0, paymentStatus: 'PAID' },
  })

  return NextResponse.json({ success: true })
}