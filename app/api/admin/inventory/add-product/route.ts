import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const { name, quantity, price } = await req.json()

  if (!name || !quantity) {
    return NextResponse.json({ error: 'اسم المنتج والكمية مطلوبين' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      defaultPrice: price ? parseFloat(price) : null,
      totalPurchased: parseInt(quantity),
      tenantId: profile.tenantId,
    },
  })

  await prisma.productRestock.create({
    data: {
      productId: product.id,
      tenantId: profile.tenantId,
      quantity: parseInt(quantity),
    },
  })

  return NextResponse.json({ success: true, product })
}