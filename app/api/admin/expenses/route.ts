import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const expenses = await prisma.expense.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { date: 'desc' },
    take: 200,
  })

  return NextResponse.json({ expenses })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { title, category, amount, date, note } = await req.json()
  if (!title || !amount) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  const expense = await prisma.expense.create({
    data: {
      tenantId: profile.tenantId,
      title,
      category: category || null,
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      note: note || null,
    },
  })

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'CREATE',
    entity: 'Expense',
    entityId: expense.id,
    details: `تسجيل مصروف: ${title} - ${amount} جنيه`,
  })

  return NextResponse.json({ success: true, expense })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense || expense.tenantId !== profile.tenantId) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })

  await prisma.expense.delete({ where: { id } })
  return NextResponse.json({ success: true })
}