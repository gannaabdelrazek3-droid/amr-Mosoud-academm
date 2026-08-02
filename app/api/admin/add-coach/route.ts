import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const achievementSchema = z.object({
  title: z.string().min(1),
  year: z.number().optional().nullable(),
})

const certificateSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().optional().or(z.literal('')),
})

const galleryItemSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().min(1),
  caption: z.string().optional().or(z.literal('')),
})

const addCoachSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  title: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  yearsExperience: z.number().optional().nullable(),
  playersTrained: z.number().optional().nullable(),
  belts: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  facebookUrl: z.string().optional().or(z.literal('')),
  instagramUrl: z.string().optional().or(z.literal('')),
  trainingSchedule: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6).optional().or(z.literal('')),
  sportIds: z.array(z.string()).optional(),
  achievements: z.array(achievementSchema).optional(),
  certificates: z.array(certificateSchema).optional(),
  gallery: z.array(galleryItemSchema).optional(),
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

    return NextResponse.json({ allSports: sports })
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
    const parsed = addCoachSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const {
      fullName, phone, title, bio, yearsExperience, playersTrained, belts,
      avatarUrl, whatsapp, facebookUrl, instagramUrl, trainingSchedule,
      isActive, displayOrder, email, password, sportIds,
      achievements, certificates, gallery,
    } = parsed.data

    const existingPhone = await prisma.profile.findUnique({ where: { phone } })
    if (existingPhone) {
      return NextResponse.json({ error: 'رقم الهاتف مستخدم بالفعل' }, { status: 400 })
    }

    let coachId: string | undefined
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
      coachId = authData.user.id
      createdAuthUserId = authData.user.id
    }

    try {
      const validSportIds = Array.isArray(sportIds)
        ? (await prisma.sport.findMany({
            where: { id: { in: sportIds }, tenantId: profile.tenantId },
            select: { id: true },
          })).map((s) => s.id)
        : []

      const coach = await prisma.$transaction(async (tx) => {
        const created = await tx.profile.create({
          data: {
            id: coachId,
            tenantId: profile.tenantId,
            fullName,
            phone,
            role: 'COACH',
            title: title || null,
            bio: bio || null,
            yearsExperience: yearsExperience ?? null,
            playersTrained: playersTrained ?? null,
            belts: belts || null,
            avatarUrl: avatarUrl || null,
            whatsapp: whatsapp || null,
            facebookUrl: facebookUrl || null,
            instagramUrl: instagramUrl || null,
            trainingSchedule: trainingSchedule || null,
            isActive: isActive ?? true,
            displayOrder: displayOrder ?? 0,
          },
        })

        if (validSportIds.length > 0) {
          await tx.coachSport.createMany({
            data: validSportIds.map((sportId: string) => ({ coachId: created.id, sportId })),
            skipDuplicates: true,
          })
        }

        if (achievements && achievements.length > 0) {
          await tx.coachAchievement.createMany({
            data: achievements.map((a, idx) => ({
              coachId: created.id,
              title: a.title,
              year: a.year ?? null,
              order: idx,
            })),
          })
        }

        if (certificates && certificates.length > 0) {
          await tx.coachCertificate.createMany({
            data: certificates.map((c, idx) => ({
              coachId: created.id,
              title: c.title,
              imageUrl: c.imageUrl || null,
              order: idx,
            })),
          })
        }

        if (gallery && gallery.length > 0) {
          await tx.coachGalleryItem.createMany({
            data: gallery.map((g, idx) => ({
              coachId: created.id,
              type: g.type,
              url: g.url,
              caption: g.caption || null,
              order: idx,
            })),
          })
        }

        return created
      })

      await logAudit({
        tenantId: profile.tenantId,
        userId: user.id,
        userRole: profile.role,
        action: 'CREATE',
        entity: 'Coach',
        entityId: coach.id,
        details: `إضافة مدرب جديد: ${fullName}`,
      })

      return NextResponse.json({ success: true, coachId: coach.id })
    } catch (dbError) {
      if (createdAuthUserId) {
        const adminSupabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        await adminSupabase.auth.admin.deleteUser(createdAuthUserId)
      }
      console.error(dbError)
      return NextResponse.json({ error: 'حدث خطأ أثناء إضافة المدرب، حاول مرة أخرى' }, { status: 500 })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}