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

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
  }

  const qty = Number(quantity)
  const remaining = product.totalPurchased - product.totalSold
  if (qty > remaining) {
    return NextResponse.json({ error: 'الكمية المطلوبة أكبر من المتاح' }, { status: 400 })
  }

  await prisma.productSale.create({
    data: {
      productId,
      tenantId: profile.tenantId,
      quantity: qty,
      pricePerUnit: product.defaultPrice,
      totalAmount: product.defaultPrice ? product.defaultPrice * qty : null,
      date: new Date(),
    },
  })

  await prisma.product.update({
    where: { id: productId },
    data: { totalSold: { increment: qty } },
  })

  return NextResponse.json({ success: true })
}