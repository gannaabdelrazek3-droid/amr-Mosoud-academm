import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })

  const sales = await prisma.productSale.findMany({
    where: { tenantId: profile.tenantId, remainingAmount: { gt: 0 } },
    include: { product: { select: { name: true } } },
    orderBy: { date: 'desc' },
  })

  const result = sales.map((s) => ({
    id: s.id,
    productName: s.product.name,
    buyerName: s.buyerName,
    quantity: s.quantity,
    totalAmount: Number(s.totalAmount),
    paidAmount: Number(s.paidAmount),
    remainingAmount: Number(s.remainingAmount),
    date: s.date,
  }))

  return NextResponse.json({ sales: result })
}