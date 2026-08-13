import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })

  const { productId, quantity, pricePerUnit, buyerName, paidAmount } = await req.json()

  if (!productId || !quantity || !pricePerUnit || paidAmount === undefined) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })

  const remaining = product.totalPurchased - product.totalSold
  const qty = parseInt(quantity)
  if (qty > remaining) {
    return NextResponse.json({ error: `الكمية المتاحة بس ${remaining}` }, { status: 400 })
  }

  const totalAmount = qty * parseFloat(pricePerUnit)
  const parsedPaid = parseFloat(paidAmount)
  const remainingAmount = Math.max(0, totalAmount - parsedPaid)
  const paymentStatus = remainingAmount <= 0 ? 'PAID' : parsedPaid > 0 ? 'PARTIAL' : 'UNPAID'

  let paymentId: string | null = null
  if (parsedPaid > 0) {
    const payment = await prisma.payment.create({
      data: {
        tenantId: profile.tenantId,
        amount: parsedPaid,
        source: 'PRODUCT_SALE',
        description: `بيع ${qty} × ${product.name}${buyerName ? ` - المشتري: ${buyerName}` : ''}`,
      },
    })
    paymentId = payment.id
  }

  await prisma.productSale.create({
    data: {
      productId,
      tenantId: profile.tenantId,
      quantity: qty,
      pricePerUnit: parseFloat(pricePerUnit),
      totalAmount,
      buyerName: buyerName || null,
      paidAmount: parsedPaid,
      remainingAmount,
      paymentStatus,
      paymentId,
    },
  })

  await prisma.product.update({ where: { id: productId }, data: { totalSold: { increment: qty } } })

  return NextResponse.json({ success: true, remainingAmount, paymentStatus })
}