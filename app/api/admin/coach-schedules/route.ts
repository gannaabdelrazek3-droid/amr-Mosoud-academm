import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const addSchema = z.object({
  coachId: z.string().min(1),
  sportId: z.string().min(1),
  groupName: z.string().min(1),
  dayOfWeek: z.number().min(0).max(6),
  time: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const coachId = req.nextUrl.searchParams.get('coachId')

  const schedules = await prisma.coachSchedule.findMany({
    where: {
      tenantId: profile.tenantId,
      ...(coachId ? { coachId } : {}),
    },
    include: { coach: { select: { fullName: true } }, sport: { select: { name: true } } },
    orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }],
  })

  return NextResponse.json({ schedules })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const body = await req.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })

  const { coachId, sportId, groupName, dayOfWeek, time } = parsed.data

  const schedule = await prisma.coachSchedule.create({
    data: { tenantId: profile.tenantId, coachId, sportId, groupName, dayOfWeek, time },
  })

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'CREATE',
    entity: 'CoachSchedule',
    entityId: schedule.id,
    details: `إضافة موعد تدريب: ${groupName} - يوم ${dayOfWeek} - ${time}`,
  })

  return NextResponse.json({ success: true, schedule })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

  const schedule = await prisma.coachSchedule.findUnique({ where: { id } })
  if (!schedule || schedule.tenantId !== profile.tenantId) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })

  await prisma.coachSchedule.delete({ where: { id } })

  return NextResponse.json({ success: true })
}