import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const editSchema = z.object({
  playerId: z.string().min(1),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  sportsBackground: z.string().optional(),
  medicalCheckExpiry: z.string().optional(),
  newSubscription: z
    .object({
      totalSessions: z.union([z.string(), z.number()]),
      endDate: z.string(),
    })
    .nullable()
    .optional(),
  skillRatings: z.record(z.string(), z.number()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = editSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { playerId, phone, birthDate, sportsBackground, medicalCheckExpiry, newSubscription, skillRatings } = parsed.data

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.coachId !== profile.id) {
      return NextResponse.json({ error: 'اللاعب غير موجود أو ليس ضمن فريقك' }, { status: 404 })
    }

    await prisma.player.update({
      where: { id: playerId },
      data: {
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        sportsBackground: sportsBackground || null,
        medicalCheckExpiry: medicalCheckExpiry ? new Date(medicalCheckExpiry) : null,
      },
    })

    if (newSubscription && newSubscription.totalSessions && newSubscription.endDate) {
      const sessions = Number(newSubscription.totalSessions)
      if (isNaN(sessions) || sessions <= 0) {
        return NextResponse.json({ error: 'عدد الحصص غير صالح' }, { status: 400 })
      }
      await prisma.subscription.create({
        data: {
          playerId,
          tenantId: profile.tenantId,
          totalSessions: sessions,
          remaining: sessions,
          endDate: new Date(newSubscription.endDate),
        },
      })
    }

    if (skillRatings && typeof skillRatings === 'object') {
      for (const [skillId, value] of Object.entries(skillRatings)) {
        if (value === null || value === undefined || String(value).trim() === '') continue
const numValue = Number(value)
        if (isNaN(numValue) || numValue < 0 || numValue > 100) continue

        // تأكيد إن المهارة فعلًا تابعة لرياضة من رياضات المدرب قبل ما نسجّل التقييم
        const skill = await prisma.skill.findUnique({ where: { id: skillId } })
        if (!skill || skill.tenantId !== profile.tenantId) continue
        const coachSport = await prisma.coachSport.findFirst({ where: { coachId: profile.id, sportId: skill.sportId } })
        if (!coachSport) continue

        await prisma.skillRating.create({
          data: { playerId, skillId, tenantId: profile.tenantId, value: numValue },
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
      details: `المدرب ${profile.fullName} عدّل بيانات اللاعب ${player.fullName}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}