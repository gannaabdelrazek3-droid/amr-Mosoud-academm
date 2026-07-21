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

  const { coachId, fullName, phone, newPassword } = await req.json()

  if (!coachId || !fullName) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  await prisma.profile.update({
    where: { id: coachId },
    data: { fullName, phone },
  })

  if (newPassword) {
    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.updateUserById(coachId, {
      password: newPassword,
    })

    if (error) {
      return NextResponse.json({ error: 'اتحفظت البيانات بس فشل تغيير الباسورد: ' + error.message }, { status: 400 })
    }
  }

  return NextResponse.json({ success: true })
}