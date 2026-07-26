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

  const body = await req.json()
  const {
    playerId,
    fullName,
    phone,
    birthDate,
    sportsBackground,
    newPassword,
    sportIds,
    newSubscription,
    skillRatings,
  } = body

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  // تحديث البيانات الأساسية
  await prisma.player.update({
    where: { id: playerId },
    data: {
      fullName,
      phone: phone || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      sportsBackground: sportsBackground || null,
    },
  })

  // تحديث كلمة المرور
  if (newPassword && player.userId) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await adminSupabase.auth.admin.updateUserById(player.userId, { password: newPassword })
    if (error) {
      return NextResponse.json({ error: 'حدثت مشكلة في تحديث كلمة المرور' }, { status: 500 })
    }
  }

  // تحديث الرياضات (إضافة/إزالة)
  if (Array.isArray(sportIds)) {
    const currentLinks = await prisma.playerSport.findMany({ where: { playerId } })
    const currentSportIds = currentLinks.map((l) => l.sportId)

    const toAdd = sportIds.filter((id: string) => !currentSportIds.includes(id))
    const toRemove = currentSportIds.filter((id) => !sportIds.includes(id))

    if (toAdd.length > 0) {
      await prisma.playerSport.createMany({
        data: toAdd.map((sportId: string) => ({ playerId, sportId })),
      })
    }
    if (toRemove.length > 0) {
      await prisma.playerSport.deleteMany({
        where: { playerId, sportId: { in: toRemove } },
      })
    }
  }

  // إنشاء اشتراك جديد
  if (newSubscription && newSubscription.totalSessions && newSubscription.endDate) {
    await prisma.subscription.create({
      data: {
        playerId,
        tenantId: profile.tenantId,
        totalSessions: Number(newSubscription.totalSessions),
        remaining: Number(newSubscription.totalSessions),
        endDate: new Date(newSubscription.endDate),
      },
    })
  }

  // تحديث تقييمات المهارات
  if (skillRatings && typeof skillRatings === 'object') {
    for (const [skillId, value] of Object.entries(skillRatings)) {
      if (value === '' || value === null || value === undefined) continue
      await prisma.skillRating.create({
        data: {
          playerId,
          skillId,
          tenantId: profile.tenantId,
          value: Number(value),
        },
      })
    }
  }

  return NextResponse.json({ success: true })
}
