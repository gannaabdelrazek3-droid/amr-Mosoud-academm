import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const itemSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().min(1),
  caption: z.string().optional().or(z.literal('')),
})

const addAlbumSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['TOURNAMENTS', 'TRAINING', 'BELT_TESTS', 'CAMPS', 'PARTIES']),
  coverUrl: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  items: z.array(itemSchema).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = addAlbumSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const { title, category, coverUrl, isActive, displayOrder, items } = parsed.data

    const album = await prisma.$transaction(async (tx) => {
      const created = await tx.mediaAlbum.create({
        data: {
          tenantId: profile.tenantId,
          title,
          category,
          coverUrl: coverUrl || null,
          isActive: isActive ?? true,
          displayOrder: displayOrder ?? 0,
        },
      })

      if (items && items.length > 0) {
        await tx.mediaAlbumItem.createMany({
          data: items.map((it, idx) => ({
            albumId: created.id,
            type: it.type,
            url: it.url,
            caption: it.caption || null,
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
      entity: 'MediaAlbum',
      entityId: album.id,
      details: `إضافة ألبوم جديد: ${title}`,
    })

    return NextResponse.json({ success: true, albumId: album.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}