import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const mediaSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().min(1),
  caption: z.string().optional().or(z.literal('')),
})

const participantSchema = z.object({
  name: z.string().min(1),
  result: z.string().optional().or(z.literal('')),
})

const addTournamentSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  location: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  media: z.array(mediaSchema).optional(),
  participants: z.array(participantSchema).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = addTournamentSchema.safeParse(body)
    if (!parsed.success) {
      console.error(parsed.error)
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const { name, date, location, description, isActive, displayOrder, media, participants } = parsed.data

    const tournament = await prisma.$transaction(async (tx) => {
      const created = await tx.tournamentEvent.create({
        data: {
          tenantId: profile.tenantId,
          name,
          date: new Date(date),
          location: location || null,
          description: description || null,
          isActive: isActive ?? true,
          displayOrder: displayOrder ?? 0,
        },
      })

      if (media && media.length > 0) {
        await tx.tournamentMedia.createMany({
          data: media.map((m, idx) => ({
            tournamentEventId: created.id,
            type: m.type,
            url: m.url,
            caption: m.caption || null,
            order: idx,
          })),
        })
      }

      if (participants && participants.length > 0) {
        await tx.tournamentParticipant.createMany({
          data: participants.map((p, idx) => ({
            tournamentEventId: created.id,
            name: p.name,
            result: p.result || null,
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
      entity: 'TournamentEvent',
      entityId: tournament.id,
      details: `إضافة بطولة جديدة: ${name}`,
    })

    return NextResponse.json({ success: true, tournamentId: tournament.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}