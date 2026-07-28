import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { fullName, phone, email, password, role } = await req.json()

  if (!fullName || !phone || !email || !password || !role) {
    return NextResponse.json({ error: 'برجاء ملء كل البيانات' }, { status: 400 })
  }
  if (role !== 'COACH' && role !== 'SECRETARY') {
    return NextResponse.json({ error: 'دور غير صالح' }, { status: 400 })
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'حدث خطأ في إنشاء الحساب، قد يكون البريد مستخدمًا بالفعل' }, { status: 500 })
  }

  await prisma.profile.create({
    data: {
      id: authData.user.id,
      fullName,
      phone,
      role,
      tenantId: profile.tenantId,
    },
  })

  return NextResponse.json({ success: true })
}