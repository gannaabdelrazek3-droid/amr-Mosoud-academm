import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const editSchema = z.object({
  id: z.string().min(1),
  season: z.number(),
  name: z.string().min(1),
  imageUrl: z.string().optional().or(z.literal('')),
  sport: z.string().optional().or(z.literal('')),
  reason: z.string().optional().or(z.literal('')),
  achievement: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

    const player = await prisma.featuredPlayer.findUnique({ where: { id } })
    if (!player) return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })

    return NextResponse.json({ player })
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
    const parsed = editSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const { id, season, name, imageUrl, sport, reason, achievement, isActive, displayOrder } = parsed.data

    const existing = await prisma.featuredPlayer.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })

    await prisma.featuredPlayer.update({
      where: { id },
      data: {
        season,
        name,
        imageUrl: imageUrl || null,
        sport: sport || null,
        reason: reason || null,
        achievement: achievement || null,
        isActive: isActive ?? true,
        displayOrder: displayOrder ?? 0,
      },
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'UPDATE',
      entity: 'FeaturedPlayer',
      entityId: id,
      details: `تعديل لاعب مميز: ${name}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}