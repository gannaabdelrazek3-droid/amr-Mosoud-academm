import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { toDateKey, dateKeyToUtcNoon } from '@/lib/datekey'

const attendanceSchema = z.object({
  playerId: z.string().min(1),
  sportId: z.string().min(1),
  date: z.string().min(1),
  present: z.boolean(),
  coachNote: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = attendanceSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    const { playerId, sportId, date, present, coachNote } = parsed.data

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.coachId !== profile.id) return NextResponse.json({ error: 'اللاعب غير موجود أو ليس ضمن فريقك' }, { status: 404 })

    const sportCheck = await prisma.sport.findUnique({ where: { id: sportId } })
    if (!sportCheck || sportCheck.tenantId !== profile.tenantId) return NextResponse.json({ error: 'الرياضة غير صالحة' }, { status: 400 })

    const coachSport = await prisma.coachSport.findFirst({ where: { coachId: profile.id, sportId } })
    if (!coachSport) return NextResponse.json({ error: 'هذه الرياضة ليست ضمن رياضاتك' }, { status: 403 })

    const dateKey = toDateKey(date)

    const existing = await prisma.attendance.findFirst({ where: { playerId, sportId, dateKey } })
    if (existing) return NextResponse.json({ error: `تم تسجيل هذا اللاعب في هذه الرياضة بتاريخ ${dateKey} بالفعل` }, { status: 400 })

    await prisma.attendance.create({
      data: {
        playerId, sportId, tenantId: profile.tenantId,
        date: dateKeyToUtcNoon(dateKey),
        dateKey,
        present,
        coachNote: coachNote || null,
        status: present ? 'PRESENT' : 'ABSENT',
        recordedById: user.id,
      },
    })

    if (present) {
      const now = new Date()
      await prisma.$transaction(async (tx) => {
        const activeSub = await tx.subscription.findFirst({
          where: { playerId, isFrozen: false, remaining: { gt: 0 }, endDate: { gte: now } },
          orderBy: { endDate: 'desc' },
        })
        if (activeSub) {
          await tx.subscription.updateMany({ where: { id: activeSub.id, remaining: { gt: 0 } }, data: { remaining: { decrement: 1 } } })
        }
      })
    }

    await logAudit({
      tenantId: profile.tenantId, userId: user.id, userRole: profile.role,
      action: 'CREATE', entity: 'Attendance', entityId: playerId,
      details: `تسجيل حضور ${present ? '(حضر)' : '(غاب)'} للاعب ${player.fullName} بتاريخ ${dateKey}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('coach manage-attendance error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}