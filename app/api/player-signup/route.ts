import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, password, fullName, phone } = await req.json()

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || 'فشل إنشاء الحساب' }, { status: 400 })
  }

  const tenant = await prisma.tenant.findFirst()

  if (!tenant) {
    return NextResponse.json({ error: 'مفيش أكاديمية مسجلة' }, { status: 500 })
  }

  await prisma.player.create({
    data: {
      fullName,
      phone: phone || null,
      email,
      userId: data.user.id,
      tenantId: tenant.id,
    },
  })

  return NextResponse.json({ success: true })
}