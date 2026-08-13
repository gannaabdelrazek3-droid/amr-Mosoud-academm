import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { playerId, sportId, present } = await req.json()
  if (!playerId || !sportId || typeof present !== 'boolean') {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player || player.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
  }

  const now = new Date()
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999)

  const existing = await prisma.attendance.findFirst({
    where: { playerId, sportId, date: { gte: startOfDay, lte: endOfDay } },
  })
  if (existing) {
    return NextResponse.json({ error: 'تم تسجيل حضور هذا اللاعب في هذه الرياضة اليوم بالفعل' }, { status: 400 })
  }

  await prisma.attendance.create({
    data: { playerId, sportId, tenantId: profile.tenantId, date: now, present, recordedById: user.id },
  })

  if (present) {
    await prisma.$transaction(async (tx) => {
      const activeSub = await tx.subscription.findFirst({
        where: { playerId, isStopped: false, remaining: { gt: 0 }, endDate: { gte: now } },
        orderBy: { endDate: 'desc' },
      })
      if (activeSub) {
        await tx.subscription.updateMany({ where: { id: activeSub.id, remaining: { gt: 0 } }, data: { remaining: { decrement: 1 } } })
      }
    })
  }

  await logAudit({
    tenantId: profile.tenantId,
    userId: user.id,
    userRole: profile.role,
    action: 'CREATE',
    entity: 'Attendance',
    entityId: playerId,
    details: `تسجيل ${present ? 'حضور' : 'غياب'} للاعب ${player.fullName} بواسطة السكرتيرة`,
  })

  return NextResponse.json({ success: true })
}