import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة، تأكدي من ملء كل الحقول' }, { status: 400 })
    }

    const { fullName, age, phone, governorate, sport, level, hasCompeted, email, password } = parsed.data

    const tenant = await prisma.tenant.findFirst()
    if (!tenant) {
      return NextResponse.json({ error: 'حدثت مشكلة في النظام، حاولي لاحقًا' }, { status: 500 })
    }

    const existingEmail = await prisma.registrationRequest.findFirst({ where: { email, status: 'pending' } })
    if (existingEmail) {
      return NextResponse.json({ error: 'يوجد طلب معلّق بالفعل بهذا البريد الإلكتروني' }, { status: 400 })
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
        hasCompeted: hasCompeted ?? false,
        email,
        password,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}