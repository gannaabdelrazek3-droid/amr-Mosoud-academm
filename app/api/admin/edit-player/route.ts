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
    medicalCheckExpiry,
    joinDate,
    coachId,
    newPassword,
    sportIds,
    newSubscription,
    skillRatings,
  } = body

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  if (coachId) {
    const coach = await prisma.profile.findUnique({ where: { id: coachId } })
    if (!coach || coach.tenantId !== profile.tenantId || coach.role !== 'COACH') {
      return NextResponse.json({ error: 'المدرب غير صالح' }, { status: 400 })
    }
  }

  await prisma.player.update({
    where: { id: playerId },
    data: {
      fullName,
      phone: phone || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      sportsBackground: sportsBackground || null,
      medicalCheckExpiry: medicalCheckExpiry ? new Date(medicalCheckExpiry) : null,
      joinDate: joinDate ? new Date(joinDate) : null,
      coachId: coachId || null,
    },
  })

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

 if (Array.isArray(sportIds)) {
    const validSports = await prisma.sport.findMany({
      where: { id: { in: sportIds }, tenantId: profile.tenantId },
      select: { id: true },
    })
    const validSportIds = validSports.map((s) => s.id)

    const currentLinks = await prisma.playerSport.findMany({ where: { playerId } })
    const currentSportIds = currentLinks.map((l) => l.sportId)

    const toAdd = validSportIds.filter((id) => !currentSportIds.includes(id))
    const toRemove = currentSportIds.filter((id) => !validSportIds.includes(id))

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

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { playerId } = await req.json()

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  if (player.userId) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await adminSupabase.auth.admin.deleteUser(player.userId)
  }

  await prisma.playerSport.deleteMany({ where: { playerId } })
  await prisma.skillRating.deleteMany({ where: { playerId } })
  await prisma.weightLog.deleteMany({ where: { playerId } })
  await prisma.playerProgress.deleteMany({ where: { playerId } })
  await prisma.attendance.deleteMany({ where: { playerId } })
  await prisma.tournament.deleteMany({ where: { playerId } })
  await prisma.payment.deleteMany({ where: { playerId } })
  await prisma.subscription.deleteMany({ where: { playerId } })
  await prisma.player.delete({ where: { id: playerId } })

  return NextResponse.json({ success: true })
}