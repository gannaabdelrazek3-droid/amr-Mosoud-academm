import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const products = await prisma.product.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { name: 'asc' },
  })

  const result = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.defaultPrice,
    remaining: p.totalPurchased - p.totalSold,
    totalSold: p.totalSold,
  }))

  return NextResponse.json({ products: result })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { productId, quantity } = await req.json()

  const qty = Number(quantity)
  if (!productId || !qty || qty <= 0) {
    return NextResponse.json({ error: 'برجاء إدخال بيانات صحيحة' }, { status: 400 })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // نجيب المنتج داخل الـ transaction نفسها عشان نضمن أحدث رقم مخزون لحظة التنفيذ
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product || product.tenantId !== profile.tenantId) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      const remaining = product.totalPurchased - product.totalSold
      if (qty > remaining) {
        throw new Error('INSUFFICIENT_STOCK')
      }

const totalAmount = product.defaultPrice ? Number(product.defaultPrice) * qty : 0

      const payment = await tx.payment.create({
        data: {
          tenantId: profile.tenantId,
          amount: totalAmount,
          source: 'PRODUCT_SALE',
          description: `بيع ${qty} × ${product.name}`,
          date: new Date(),
        },
      })

      const sale = await tx.productSale.create({
        data: {
          productId,
          tenantId: profile.tenantId,
          quantity: qty,
          pricePerUnit: product.defaultPrice,
          totalAmount,
          date: new Date(),
          paymentId: payment.id,
        },
      })

      // تحديث المخزون بشرط ذري: يفشل تلقائيًا لو حد تاني باع في نفس اللحظة وخلّى الكمية غير كافية
      const updated = await tx.product.updateMany({
        where: {
          id: productId,
          totalSold: product.totalSold, // يتأكد إن الرقم لسه زي ما قريناه، وإلا العملية تتلغي بالكامل
        },
        data: { totalSold: { increment: qty } },
      })

      if (updated.count === 0) {
        throw new Error('CONCURRENT_UPDATE')
      }

      return sale
    })

    return NextResponse.json({ success: true, saleId: result.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'UNKNOWN'
    if (message === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
    }
    if (message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ error: 'الكمية المطلوبة أكبر من المتاح' }, { status: 400 })
    }
    if (message === 'CONCURRENT_UPDATE') {
      return NextResponse.json({ error: 'حدث تعارض في المخزون، برجاء إعادة المحاولة' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}