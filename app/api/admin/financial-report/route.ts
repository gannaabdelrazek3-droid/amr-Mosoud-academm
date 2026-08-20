import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const month = parseInt(req.nextUrl.searchParams.get('month') || String(new Date().getMonth() + 1))
  const year = parseInt(req.nextUrl.searchParams.get('year') || String(new Date().getFullYear()))

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const [subscriptionPayments, productPayments, expenses, withdrawals] = await Promise.all([
    prisma.payment.findMany({
      where: { tenantId: profile.tenantId, source: 'SUBSCRIPTION', status: 'ACTIVE', date: { gte: startDate, lte: endDate } },
      include: { player: { select: { fullName: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.payment.findMany({
      where: { tenantId: profile.tenantId, source: 'PRODUCT_SALE', status: 'ACTIVE', date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'desc' },
    }),
    prisma.expense.findMany({
      where: { tenantId: profile.tenantId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'desc' },
    }),
    prisma.withdrawal.findMany({
      where: { tenantId: profile.tenantId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'desc' },
    }),
  ])

  const subscriptionIncome = subscriptionPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const inventoryIncome = productPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0)
  const grossIncome = subscriptionIncome + inventoryIncome
  const netIncome = grossIncome - totalExpenses - totalWithdrawals

  return NextResponse.json({
    month,
    year,
    subscriptionIncome,
    inventoryIncome,
    grossIncome,
    totalExpenses,
    totalWithdrawals,
    netIncome,
    subscriptionPayments: subscriptionPayments.map((p) => ({ amount: Number(p.amount), date: p.date, description: p.description, playerName: p.player?.fullName || '—' })),
    productPayments: productPayments.map((p) => ({ amount: Number(p.amount), date: p.date, description: p.description })),
    expenses: expenses.map((e) => ({ title: e.title, category: e.category, amount: Number(e.amount), date: e.date })),
    withdrawals: withdrawals.map((w) => ({ withdrawnBy: w.withdrawnBy, reason: w.reason, amount: Number(w.amount), date: w.date })),
  })
}