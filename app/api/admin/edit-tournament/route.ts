import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const mediaSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().min(1),
  caption: z.string().optional().or(z.literal('')),
})

const participantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  result: z.string().optional().or(z.literal('')),
})

const editTournamentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  date: z.string().min(1),
  location: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  media: z.array(mediaSchema).optional(),
  participants: z.array(participantSchema).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'معرف البطولة مطلوب' }, { status: 400 })

    const tournament = await prisma.tournamentEvent.findUnique({
      where: { id },
      include: {
        media: { orderBy: { order: 'asc' } },
        participants: { orderBy: { order: 'asc' } },
      },
    })

    if (!tournament) return NextResponse.json({ error: 'البطولة غير موجودة' }, { status: 404 })

    return NextResponse.json({ tournament })
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
    const parsed = editTournamentSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const { id, name, date, location, description, isActive, displayOrder, media, participants } = parsed.data

    const existing = await prisma.tournamentEvent.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'البطولة غير موجودة' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.tournamentEvent.update({
        where: { id },
        data: {
          name,
          date: new Date(date),
          location: location || null,
          description: description || null,
          isActive: isActive ?? true,
          displayOrder: displayOrder ?? 0,
        },
      })

      await tx.tournamentMedia.deleteMany({ where: { tournamentEventId: id } })
      if (media && media.length > 0) {
        await tx.tournamentMedia.createMany({
          data: media.map((m, idx) => ({
            tournamentEventId: id,
            type: m.type,
            url: m.url,
            caption: m.caption || null,
            order: idx,
          })),
        })
      }

      await tx.tournamentParticipant.deleteMany({ where: { tournamentEventId: id } })
      if (participants && participants.length > 0) {
        await tx.tournamentParticipant.createMany({
          data: participants.map((p, idx) => ({
            tournamentEventId: id,
            name: p.name,
            result: p.result || null,
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
      entity: 'TournamentEvent',
      entityId: id,
      details: `تعديل بطولة: ${name}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}