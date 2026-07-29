import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { requestId, action, coachId } = await req.json()

  const request = await prisma.registrationRequest.findUnique({ where: { id: requestId } })
  if (!request || request.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  if (action === 'approve') {
    if (!coachId) {
      return NextResponse.json({ error: 'يجب اختيار المدرب المسؤول' }, { status: 400 })
    }

    const coach = await prisma.profile.findUnique({ where: { id: coachId } })
    if (!coach || coach.tenantId !== profile.tenantId || coach.role !== 'COACH') {
      return NextResponse.json({ error: 'المدرب غير صالح' }, { status: 400 })
    }

    let sport = await prisma.sport.findFirst({
      where: { tenantId: profile.tenantId, name: request.sport },
    })
    if (!sport) {
      sport = await prisma.sport.create({
        data: { tenantId: profile.tenantId, name: request.sport },
      })
    }

    function generateTempPassword() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
      let pw = ''
      for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)]
      return pw
    }

    const tempPassword = generateTempPassword()

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: request.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'حدث خطأ في إنشاء الحساب، قد يكون البريد مستخدمًا بالفعل' }, { status: 500 })
    }

    const player = await prisma.player.create({
      data: {
        tenantId: profile.tenantId,
        fullName: request.fullName,
        phone: request.phone,
        email: request.email,
        userId: authData.user.id,
        joinDate: new Date(),
        coachId: coach.id,
      },
    })

    await prisma.playerSport.create({
      data: { playerId: player.id, sportId: sport.id },
    })

    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: 'approved' },
    })

    return NextResponse.json({ success: true, tempPassword })
  } else {
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' },
    })
    return NextResponse.json({ success: true })
  }
}