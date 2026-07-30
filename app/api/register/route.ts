import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(1),
  age: z.union([z.string(), z.number()]),
  phone: z.string().min(1),
  governorate: z.string().min(1),
  sport: z.string().min(1),
  level: z.string().min(1),
  hasCompeted: z.boolean().optional(),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const allowed = checkRateLimit(`register:${ip}`, 5, 10 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'تم إرسال طلبات كثيرة، برجاء المحاولة لاحقًا' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'برجاء ملء جميع الحقول المطلوبة بشكل صحيح' }, { status: 400 })
    }
    const { fullName, age, phone, governorate, sport, level, hasCompeted, email } = parsed.data

    const ageNum = Number(age)
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 80) {
      return NextResponse.json({ error: 'السن غير صالح' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findFirst()
    if (!tenant) {
      return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 })
    }

    await prisma.registrationRequest.create({
      data: {
        tenantId: tenant.id,
        fullName,
        age: ageNum,
        phone,
        governorate,
        sport,
        level,
        hasCompeted: Boolean(hasCompeted),
        email,
        password: '',
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}