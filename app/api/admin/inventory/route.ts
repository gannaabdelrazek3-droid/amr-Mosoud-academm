import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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
    revenue: p.sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
  }))

  return NextResponse.json({ products: result })
}