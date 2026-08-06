import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const addStaffSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['COACH', 'SECRETARY']),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SECRETARY')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const body = await req.json()
    const parsed = addStaffSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'برجاء ملء كل البيانات بشكل صحيح' }, { status: 400 })
    }
    const { fullName, phone, email, password, role } = parsed.data

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

    try {
      await prisma.profile.create({
        data: {
          id: authData.user.id,
          fullName,
          phone,
          role,
          tenantId: profile.tenantId,
        },
      })
    } catch (dbError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      console.error(dbError)
      return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب، تأكد من عدم تكرار رقم الهاتف' }, { status: 500 })
    }

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Profile',
      entityId: authData.user.id,
      details: `إضافة ${role === 'COACH' ? 'مدرب' : 'سكرتيرة'} جديد: ${fullName}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}