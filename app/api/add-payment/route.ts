import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    })

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SECRETARY')) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const body = await req.json()
    const { amount, description } = body

    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: 'يرجى إدخال مبلغ صحيح أكبر من الصفر' }, { status: 400 })
    }

    await prisma.payment.create({
      data: {
        tenantId: profile.tenantId,
        amount: parsedAmount,
        source: 'MANUAL',
        description: description || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error adding manual payment:', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء حفظ الدفعة' }, { status: 500 })
  }
}