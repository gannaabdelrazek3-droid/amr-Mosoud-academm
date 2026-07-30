import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const addPlayerSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  sportsBackground: z.string().optional(),
  medicalCheckExpiry: z.string().optional(),
  joinDate: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6).optional().or(z.literal('')),
  coachId: z.string().min(1),
  sportIds: z.array(z.string()).optional(),
})

export async function GET() {
  try {
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
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = addPlayerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
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
    } = parsed.data

    const coach = await prisma.profile.findUnique({ where: { id: coachId } })
    if (!coach || coach.tenantId !== profile.tenantId || (coach.role !== 'COACH' && coach.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'المدرب غير صالح' }, { status: 400 })
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
            email: email || null,
            userId: userId || null,
            birthDate: birthDate ? new Date(birthDate) : null,
            sportsBackground: sportsBackground || null,
            medicalCheckExpiry: medicalCheckExpiry ? new Date(medicalCheckExpiry) : null,
            joinDate: joinDate ? new Date(joinDate) : new Date(),
            coachId: coach.id,
          },
        })

        if (validSportIds.length > 0) {
          await tx.playerSport.createMany({
            data: validSportIds.map((sportId: string) => ({ playerId: created.id, sportId })),
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

      return NextResponse.json({ success: true })
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