import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { productId, quantity } = await req.json()

  const qty = Number(quantity)
  if (!productId || !qty || qty <= 0) {
    return NextResponse.json({ error: 'برجاء إدخال بيانات صحيحة' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.productRestock.create({
      data: { productId, tenantId: profile.tenantId, quantity: qty },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { totalPurchased: { increment: qty } },
    }),
  ])

  return NextResponse.json({ success: true })
}