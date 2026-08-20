import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { toDateKey, dateKeyToUtcNoon } from '@/lib/datekey'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const { playerId, sportId, date, status } = await req.json()
    if (!playerId || !sportId || !date || !status) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })

    const dateKey = toDateKey(date)
    const targetDate = dateKeyToUtcNoon(dateKey)

    const existing = await prisma.attendance.findFirst({ where: { playerId, sportId, dateKey } })
    const present = status === 'PRESENT'

    if (existing) {
      if (status === 'CLEAR') {
        await prisma.attendance.delete({ where: { id: existing.id } })
        if (existing.present) {
          const sub = await prisma.subscription.findFirst({ where: { playerId }, orderBy: { endDate: 'desc' } })
          if (sub) await prisma.subscription.update({ where: { id: sub.id }, data: { remaining: { increment: 1 } } })
        }
      } else {
        const wasPresent = existing.present
        await prisma.attendance.update({ where: { id: existing.id }, data: { status, present } })

        if (wasPresent && !present) {
          const sub = await prisma.subscription.findFirst({ where: { playerId }, orderBy: { endDate: 'desc' } })
          if (sub) await prisma.subscription.update({ where: { id: sub.id }, data: { remaining: { increment: 1 } } })
        } else if (!wasPresent && present) {
          const sub = await prisma.subscription.findFirst({ where: { playerId, remaining: { gt: 0 } }, orderBy: { endDate: 'desc' } })
          if (sub) await prisma.subscription.update({ where: { id: sub.id }, data: { remaining: { decrement: 1 } } })
        }
      }
    } else if (status !== 'CLEAR') {
      await prisma.attendance.create({
        data: { playerId, sportId, tenantId: profile.tenantId, date: targetDate, dateKey, present, status, recordedById: user.id },
      })
      if (present) {
        const sub = await prisma.subscription.findFirst({ where: { playerId, remaining: { gt: 0 } }, orderBy: { endDate: 'desc' } })
        if (sub) await prisma.subscription.update({ where: { id: sub.id }, data: { remaining: { decrement: 1 } } })
      }
    }

    await logAudit({
      tenantId: profile.tenantId, userId: user.id, userRole: profile.role,
      action: 'UPDATE', entity: 'Attendance', entityId: playerId,
      details: `تحديد حالة الحضور: ${status} للاعب ${player.fullName} بتاريخ ${dateKey}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('attendance-matrix set-status error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة في الخادم' }, { status: 500 })
  }
}