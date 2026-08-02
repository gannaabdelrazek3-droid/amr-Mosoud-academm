import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const addSchema = z.object({
  season: z.number(),
  name: z.string().min(1),
  imageUrl: z.string().optional().or(z.literal('')),
  sport: z.string().optional().or(z.literal('')),
  reason: z.string().optional().or(z.literal('')),
  achievement: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = addSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const { season, name, imageUrl, sport, reason, achievement, isActive, displayOrder } = parsed.data

    const player = await prisma.featuredPlayer.create({
      data: {
        tenantId: profile.tenantId,
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
      action: 'CREATE',
      entity: 'FeaturedPlayer',
      entityId: player.id,
      details: `إضافة لاعب مميز: ${name} (موسم ${season})`,
    })

    return NextResponse.json({ success: true, playerId: player.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}