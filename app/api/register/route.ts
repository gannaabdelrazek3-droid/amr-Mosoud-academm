import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, age, phone, governorate, sport, level, hasCompeted } = body

    if (!fullName || !age || !phone || !governorate || !sport || !level) {
      return NextResponse.json({ error: 'برجاء ملء جميع الحقول المطلوبة' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findFirst()
    if (!tenant) {
      return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 })
    }

    await prisma.registrationRequest.create({
      data: {
        tenantId: tenant.id,
        fullName,
        age: Number(age),
        phone,
        governorate,
        sport,
        level,
        hasCompeted: Boolean(hasCompeted),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}