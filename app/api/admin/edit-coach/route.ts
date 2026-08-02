import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const achievementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  year: z.number().optional().nullable(),
})

const certificateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  imageUrl: z.string().optional().or(z.literal('')),
})

const galleryItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().min(1),
  caption: z.string().optional().or(z.literal('')),
})

const editCoachSchema = z.object({
  id: z.string().min(1),
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
  sportIds: z.array(z.string()).optional(),
  achievements: z.array(achievementSchema).optional(),
  certificates: z.array(certificateSchema).optional(),
  gallery: z.array(galleryItemSchema).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const coachId = req.nextUrl.searchParams.get('id')
    if (!coachId) return NextResponse.json({ error: 'معرف المدرب مطلوب' }, { status: 400 })

    const coach = await prisma.profile.findUnique({
      where: { id: coachId },
      include: {
        coachSports: { include: { sport: true } },
        achievements: { orderBy: { order: 'asc' } },
        certificates: { orderBy: { order: 'asc' } },
        galleryItems: { orderBy: { order: 'asc' } },
      },
    })

    if (!coach || coach.role !== 'COACH') {
      return NextResponse.json({ error: 'المدرب غير موجود' }, { status: 404 })
    }

    const allSports = await prisma.sport.findMany({
      where: { tenantId: profile.tenantId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ coach, allSports })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = editCoachSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const {
      id, fullName, phone, title, bio, yearsExperience, playersTrained, belts,
      avatarUrl, whatsapp, facebookUrl, instagramUrl, trainingSchedule,
      isActive, displayOrder, sportIds, achievements, certificates, gallery,
    } = parsed.data

    const existing = await prisma.profile.findUnique({ where: { id } })
    if (!existing || existing.role !== 'COACH') {
      return NextResponse.json({ error: 'المدرب غير موجود' }, { status: 404 })
    }

    const phoneOwner = await prisma.profile.findUnique({ where: { phone } })
    if (phoneOwner && phoneOwner.id !== id) {
      return NextResponse.json({ error: 'رقم الهاتف مستخدم بالفعل' }, { status: 400 })
    }

    const validSportIds = Array.isArray(sportIds)
      ? (await prisma.sport.findMany({
          where: { id: { in: sportIds }, tenantId: profile.tenantId },
          select: { id: true },
        })).map((s) => s.id)
      : []

    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id },
        data: {
          fullName,
          phone,
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

      // إعادة بناء الرياضات
      await tx.coachSport.deleteMany({ where: { coachId: id } })
      if (validSportIds.length > 0) {
        await tx.coachSport.createMany({
          data: validSportIds.map((sportId: string) => ({ coachId: id, sportId })),
          skipDuplicates: true,
        })
      }

      // إعادة بناء الإنجازات
      await tx.coachAchievement.deleteMany({ where: { coachId: id } })
      if (achievements && achievements.length > 0) {
        await tx.coachAchievement.createMany({
          data: achievements.map((a, idx) => ({
            coachId: id,
            title: a.title,
            year: a.year ?? null,
            order: idx,
          })),
        })
      }

      // إعادة بناء الشهادات
      await tx.coachCertificate.deleteMany({ where: { coachId: id } })
      if (certificates && certificates.length > 0) {
        await tx.coachCertificate.createMany({
          data: certificates.map((c, idx) => ({
            coachId: id,
            title: c.title,
            imageUrl: c.imageUrl || null,
            order: idx,
          })),
        })
      }

      // إعادة بناء المعرض
      await tx.coachGalleryItem.deleteMany({ where: { coachId: id } })
      if (gallery && gallery.length > 0) {
        await tx.coachGalleryItem.createMany({
          data: gallery.map((g, idx) => ({
            coachId: id,
            type: g.type,
            url: g.url,
            caption: g.caption || null,
            order: idx,
          })),
        })
      }
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'UPDATE',
      entity: 'Coach',
      entityId: id,
      details: `تعديل بيانات المدرب: ${fullName}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}