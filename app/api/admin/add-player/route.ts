import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { calculateSubscriptionEndDate } from '@/lib/subscriptionSchedule'

const addPlayerSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional().or(z.literal('')),
  playerCode: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  sportsBackground: z.string().optional().or(z.literal('')),
  medicalCheckExpiry: z.string().optional().or(z.literal('')),
  joinDate: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6).optional().or(z.literal('')),
  coachId: z.string().optional().or(z.literal('')),
  sportIds: z.array(z.string()).optional(),
  avatarUrl: z.string().optional().or(z.literal('')),
  currentBelt: z.string().optional().or(z.literal('')),
  targetBelt: z.string().optional().or(z.literal('')),
  newSubscription: z.object({
    sportId: z.string().optional().nullable(),
    totalSessions: z.number(),
    totalAmount: z.number(),
    paidAmount: z.number(),
    remainingAmount: z.number(),
  }).optional().nullable(),
  skillRatings: z.record(z.string(), z.string()).optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SECRETARY')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const sports = await prisma.sport.findMany({
      where: { tenantId: profile.tenantId },
      orderBy: { name: 'asc' },
    })

    // التعديل هنا: جلب كل المدربين والآدمن بدون قيود الـ tenantId لضمان ظهورهم في خانة المدرب
    const coaches = await prisma.profile.findMany({
      where: { 
        role: { in: ['COACH', 'ADMIN'] } 
      },
      select: { id: true, fullName: true, role: true },
    })

    console.log("Coaches fetched from DB:", coaches)

    return NextResponse.json({ allSports: sports, coaches })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SECRETARY')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const body = await req.json()
    const parsed = addPlayerSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const {
      fullName,
      phone,
      playerCode,
      birthDate,
      sportsBackground,
      medicalCheckExpiry,
      joinDate,
      email,
      password,
      coachId,
      sportIds,
      avatarUrl,
      currentBelt,
      targetBelt,
      newSubscription,
      skillRatings,
    } = parsed.data

    if (coachId) {
      const coach = await prisma.profile.findUnique({ where: { id: coachId } })
      if (!coach || (coach.role !== 'COACH' && coach.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'المدرب أو المسؤول غير صالح' }, { status: 400 })
      }
    }

    let userId: string | undefined
    let createdAuthUserId: string | null = null

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
      createdAuthUserId = authData.user.id
    }

    try {
      const validSportIds = Array.isArray(sportIds)
        ? (await prisma.sport.findMany({
            where: { id: { in: sportIds }, tenantId: profile.tenantId },
            select: { id: true },
          })).map((s) => s.id)
        : []

      const player = await prisma.$transaction(async (tx) => {
        const created = await tx.player.create({
          data: {
            tenantId: profile.tenantId,
            fullName,
            phone: phone || null,
            playerCode: playerCode || null,
            email: email || null,
            userId: userId || null,
            birthDate: birthDate ? new Date(birthDate) : null,
            sportsBackground: sportsBackground || null,
            medicalCheckExpiry: medicalCheckExpiry ? new Date(medicalCheckExpiry) : null,
            joinDate: joinDate ? new Date(joinDate) : new Date(),
            coachId: coachId || null,
            avatarUrl: avatarUrl || null,
            currentBelt: currentBelt || null,
            targetBelt: targetBelt || null,
          },
        })

        if (validSportIds.length > 0) {
          await tx.playerSport.createMany({
            data: validSportIds.map((sportId: string) => ({ playerId: created.id, sportId })),
            skipDuplicates: true,
          })
        }

        if (newSubscription && newSubscription.totalSessions) {
          const totalAmt = Number(newSubscription.totalAmount || 0)
          const paidAmt = Number(newSubscription.paidAmount || 0)
          const remainingAmt = Math.max(0, totalAmt - paidAmt)
          const paymentSt = remainingAmt <= 0 ? 'PAID' : paidAmt > 0 ? 'PARTIAL' : 'UNPAID'
          const startDateVal = joinDate ? new Date(joinDate) : new Date()

          const calculatedEndDate = await calculateSubscriptionEndDate(
            coachId || null,
            newSubscription.sportId || null,
            Number(newSubscription.totalSessions),
            startDateVal
          )

          const subscription = await tx.subscription.create({
            data: {
              playerId: created.id,
              tenantId: profile.tenantId,
              sportId: newSubscription.sportId || null,
              totalSessions: Number(newSubscription.totalSessions),
              remaining: Number(newSubscription.totalSessions),
              totalAmount: totalAmt,
              paidAmount: paidAmt,
              remainingAmount: remainingAmt,
              paymentStatus: paymentSt,
              startDate: startDateVal,
              endDate: calculatedEndDate,
            },
          })

          if (paidAmt > 0) {
            await tx.payment.create({
              data: {
                tenantId: profile.tenantId,
                playerId: created.id,
                subscriptionId: subscription.id,
                amount: paidAmt,
                source: 'SUBSCRIPTION',
                description: `دفعة اشتراك أولية للاعب: ${fullName}`,
                date: new Date(),
              },
            })
          }
        }

        if (skillRatings && Object.keys(skillRatings).length > 0) {
          const ratingData = Object.entries(skillRatings).map(([skillId, value]) => ({
            playerId: created.id,
            skillId,
            tenantId: profile.tenantId,
            value: Number(value),
          }))

          await tx.skillRating.createMany({
            data: ratingData,
          })
        }

        return created
      })

      await logAudit({
        tenantId: profile.tenantId,
        userId: user.id,
        userRole: profile.role,
        action: 'CREATE',
        entity: 'Player',
        entityId: player.id,
        details: `إضافة لاعب جديد: ${fullName}`,
      })

      return NextResponse.json({ success: true, playerId: player.id })
    } catch (dbError) {
      if (createdAuthUserId) {
        const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
        await adminSupabase.auth.admin.deleteUser(createdAuthUserId)
      }
      console.error(dbError)
      return NextResponse.json({ error: 'حدث خطأ أثناء إضافة اللاعب، حاول مرة أخرى' }, { status: 500 })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}