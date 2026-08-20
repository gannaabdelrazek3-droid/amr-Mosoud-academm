import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { calculateSubscriptionEndDate } from '@/lib/subscriptionSchedule'

const editSchema = z.object({
  playerId: z.string().min(1),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  sportsBackground: z.string().optional(),
  medicalCheckExpiry: z.string().optional(),
  joinDate: z.string().optional(),
  coachId: z.string().optional(),
  newPassword: z.string().min(6).optional().or(z.literal('')),
  sportIds: z.array(z.string()).optional(),
  avatarUrl: z.string().optional().or(z.literal('')),
  currentBelt: z.string().optional().or(z.literal('')),
  targetBelt: z.string().optional().or(z.literal('')),
  newSubscription: z
    .object({
      sportId: z.string().optional().nullable(),
      totalSessions: z.union([z.string(), z.number()]),
    })
    .nullable()
    .optional(),
  skillRatings: z.record(z.string(), z.string()).optional(),
})

const deleteSchema = z.object({
  playerId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const body = await req.json()
  const parsed = editSchema.safeParse(body)
  if (!parsed.success) {
    console.error(parsed.error)
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }
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
    avatarUrl,
    currentBelt,
    targetBelt,
    newSubscription,
    skillRatings,
  } = parsed.data

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  if (coachId) {
    const coach = await prisma.profile.findUnique({ where: { id: coachId } })
    if (!coach || coach.tenantId !== profile.tenantId || (coach.role !== 'COACH' && coach.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'المدرب غير صالح' }, { status: 400 })
    }
  }

  // ✅ الإصلاح: حفظ avatarUrl و currentBelt و targetBelt فعليًا عند التعديل
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
      avatarUrl: avatarUrl || null,
      currentBelt: currentBelt || null,
      targetBelt: targetBelt || null,
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

  if (newSubscription && newSubscription.totalSessions) {
    const sessions = Number(newSubscription.totalSessions)
    if (isNaN(sessions) || sessions <= 0) {
      return NextResponse.json({ error: 'عدد الحصص غير صالح' }, { status: 400 })
    }

    const finalCoachId = coachId || player.coachId
    const startDate = new Date()
    const calculatedEndDate = await calculateSubscriptionEndDate(
      finalCoachId || null,
      newSubscription.sportId || null,
      sessions,
      startDate
    )

    await prisma.subscription.create({
      data: {
        playerId,
        tenantId: profile.tenantId,
        sportId: newSubscription.sportId || null,
        totalSessions: sessions,
        remaining: sessions,
        startDate,
        endDate: calculatedEndDate,
      },
    })
  }

  if (skillRatings && typeof skillRatings === 'object') {
    for (const [skillId, value] of Object.entries(skillRatings)) {
      if (value === '' || value === null || value === undefined) continue
      const numValue = Number(value)
      if (isNaN(numValue) || numValue < 0 || numValue > 100) continue
      await prisma.skillRating.create({
        data: {
          playerId,
          skillId,
          tenantId: profile.tenantId,
          value: numValue,
        },
      })
    }
  }

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'UPDATE',
    entity: 'Player',
    entityId: playerId,
    details: `تعديل بيانات اللاعب ${fullName}`,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const body = await req.json()
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }
  const { playerId } = parsed.data

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

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'DELETE',
    entity: 'Player',
    entityId: playerId,
    details: `حذف اللاعب ${player.fullName} نهائيًا`,
  })

  return NextResponse.json({ success: true })
}