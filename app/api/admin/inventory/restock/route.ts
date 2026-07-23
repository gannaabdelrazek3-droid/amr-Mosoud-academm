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

  const { productId, quantity } = await req.json()

  if (!productId || !quantity) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  await prisma.product.update({
    where: { id: productId },
    data: { totalPurchased: { increment: parseInt(quantity) } },
  })

  await prisma.productRestock.create({
    data: {
      productId,
      tenantId: profile.tenantId,
      quantity: parseInt(quantity),
    },
  })

  return NextResponse.json({ success: true })
}