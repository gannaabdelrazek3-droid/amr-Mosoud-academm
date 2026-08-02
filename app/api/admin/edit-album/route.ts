import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const itemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().min(1),
  caption: z.string().optional().or(z.literal('')),
})

const editAlbumSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(['TOURNAMENTS', 'TRAINING', 'BELT_TESTS', 'CAMPS', 'PARTIES']),
  coverUrl: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  items: z.array(itemSchema).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'معرف الألبوم مطلوب' }, { status: 400 })

    const album = await prisma.mediaAlbum.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    })

    if (!album) return NextResponse.json({ error: 'الألبوم غير موجود' }, { status: 404 })

    return NextResponse.json({ album })
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
    const parsed = editAlbumSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const { id, title, category, coverUrl, isActive, displayOrder, items } = parsed.data

    const existing = await prisma.mediaAlbum.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'الألبوم غير موجود' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.mediaAlbum.update({
        where: { id },
        data: {
          title,
          category,
          coverUrl: coverUrl || null,
          isActive: isActive ?? true,
          displayOrder: displayOrder ?? 0,
        },
      })

      await tx.mediaAlbumItem.deleteMany({ where: { albumId: id } })
      if (items && items.length > 0) {
        await tx.mediaAlbumItem.createMany({
          data: items.map((it, idx) => ({
            albumId: id,
            type: it.type,
            url: it.url,
            caption: it.caption || null,
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
      entity: 'MediaAlbum',
      entityId: id,
      details: `تعديل ألبوم: ${title}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}