import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const eventTypes = ['TRAINING', 'TOURNAMENT', 'TEST', 'ACTIVITY', 'MATCH', 'MEETING', 'CAMP', 'OTHER'] as const

const addSchema = z.object({
  title: z.string().min(1),
  type: z.enum(eventTypes),
  date: z.string().min(1),
  time: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  extraInfo: z.string().optional().or(z.literal('')),
  sportId: z.string().optional().or(z.literal('')),
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

    const { title, type, date, time, location, category, notes, extraInfo, sportId } = parsed.data

    if (sportId) {
      const sport = await prisma.sport.findUnique({ where: { id: sportId } })
      if (!sport || sport.tenantId !== profile.tenantId) {
        return NextResponse.json({ error: 'الرياضة غير صالحة' }, { status: 400 })
      }
    }

    const event = await prisma.event.create({
      data: {
        tenantId: profile.tenantId,
        title,
        type,
        date: new Date(date),
        time: time || null,
        location: location || null,
        category: category || null,
        notes: notes || null,
        extraInfo: extraInfo || null,
        sportId: sportId || null,
      },
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Event',
      entityId: event.id,
      details: `إضافة حدث جديد بالتقويم: ${title}`,
    })

    return NextResponse.json({ success: true, event })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const { eventId } = body
    if (!eventId) return NextResponse.json({ error: 'معرف الحدث مطلوب' }, { status: 400 })

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event || event.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'الحدث غير موجود' }, { status: 404 })
    }

    await prisma.event.delete({ where: { id: eventId } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'Event',
      entityId: eventId,
      details: `حذف حدث من التقويم: ${event.title}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}