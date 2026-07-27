import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const sports = await prisma.sport.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { name: 'asc' },
  })

  
  const coaches = await prisma.profile.findMany({
    where: { tenantId: profile.tenantId, role: { in: ['COACH', 'ADMIN'] } },
    select: { id: true, fullName: true },
  })

  return NextResponse.json({ sports, coaches })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const body = await req.json()
  const {
    fullName,
    phone,
    birthDate,
    sportsBackground,
    medicalCheckExpiry,
    joinDate,
    email,
    password,
    coachId,
    sportIds,
  } = body

  if (!fullName || !coachId) {
    return NextResponse.json({ error: 'برجاء ملء البيانات الأساسية واختيار المدرب' }, { status: 400 })
  }

  
  const coach = await prisma.profile.findUnique({ where: { id: coachId } })
  if (!coach || coach.tenantId !== profile.tenantId || !['COACH', 'ADMIN'].includes(coach.role)) {
    return NextResponse.json({ error: 'المسؤول أو المدرب غير صالح' }, { status: 400 })
  }

  let userId: string | undefined

  if (email && password) {
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
    userId = authData.user.id
  }

  const player = await prisma.player.create({
    data: {
      tenantId: profile.tenantId,
      fullName,
      phone: phone || null,
      email: email || null,
      userId: userId || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      sportsBackground: sportsBackground || null,
      medicalCheckExpiry: medicalCheckExpiry ? new Date(medicalCheckExpiry) : null,
      joinDate: joinDate ? new Date(joinDate) : new Date(),
      coachId: coach.id,
    },
  })

  if (Array.isArray(sportIds) && sportIds.length > 0) {
    await prisma.playerSport.createMany({
      data: sportIds.map((sportId: string) => ({ playerId: player.id, sportId })),
    })
  }

  return NextResponse.json({ success: true })
}