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

  const withdrawals = await prisma.withdrawal.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { date: 'desc' },
    take: 200,
  })

  return NextResponse.json({ withdrawals })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { amount, withdrawnBy, reason, date } = await req.json()
  if (!amount || !withdrawnBy) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  const withdrawal = await prisma.withdrawal.create({
    data: {
      tenantId: profile.tenantId,
      amount: parseFloat(amount),
      withdrawnBy,
      reason: reason || null,
      date: date ? new Date(date) : new Date(),
    },
  })

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'CREATE',
    entity: 'Withdrawal',
    entityId: withdrawal.id,
    details: `سحب مبلغ ${amount} جنيه بواسطة ${withdrawnBy}`,
  })

  return NextResponse.json({ success: true, withdrawal })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

  const w = await prisma.withdrawal.findUnique({ where: { id } })
  if (!w || w.tenantId !== profile.tenantId) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })

  await prisma.withdrawal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}