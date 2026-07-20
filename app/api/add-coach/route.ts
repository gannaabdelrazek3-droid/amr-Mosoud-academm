import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const { fullName, phone, email, password, sportIds } = await req.json()

  if (!fullName || !phone || !email || !password) {
    return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'فشل إنشاء حساب المدرب' }, { status: 400 })
  }

  const coach = await prisma.profile.create({
    data: {
      id: authData.user.id,
      fullName,
      phone,
      role: 'COACH',
      tenantId: profile.tenantId,
    },
  })

  if (sportIds && sportIds.length > 0) {
    await prisma.coachSport.createMany({
      data: sportIds.map((sportId: string) => ({
        coachId: coach.id,
        sportId,
      })),
    })
  }

  return NextResponse.json({ success: true, coach })
}