import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })

  const products = await prisma.product.findMany({
    where: { tenantId: profile.tenantId },
    include: { sales: true },
    orderBy: { name: 'asc' },
  })

  const result = products.map((p) => ({
    id: p.id,
    name: p.name,
    defaultPrice: p.defaultPrice,
    remaining: p.totalPurchased - p.totalSold,
    totalPurchased: p.totalPurchased,
    totalSold: p.totalSold,
    revenue: p.sales.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0),
  }))

  return NextResponse.json({ products: result })
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })

  const { id, name, defaultPrice } = await req.json()
  if (!id || !name) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.tenantId !== profile.tenantId) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })

  await prisma.product.update({
    where: { id },
    data: { name, defaultPrice: defaultPrice ? parseFloat(defaultPrice) : null },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.tenantId !== profile.tenantId) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })

  try {
    await prisma.product.delete({ where: { id } })
  } catch {
    return NextResponse.json({ error: 'لا يمكن حذف هذا المنتج لوجود عمليات بيع مرتبطة به' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}