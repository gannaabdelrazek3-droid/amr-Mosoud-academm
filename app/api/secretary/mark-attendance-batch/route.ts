import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { toDateKey, dateKeyToUtcNoon } from '@/lib/datekey'

interface RecordInput { playerId: string; sportId: string; present: boolean }

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'SECRETARY') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const records: RecordInput[] = body.records
    const dateParam: string = body.date

    if (!dateParam) return NextResponse.json({ error: 'التاريخ مطلوب' }, { status: 400 })
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'لا يوجد سجلات لحفظها' }, { status: 400 })
    }

    const dateKey = toDateKey(dateParam)
    const targetDate = dateKeyToUtcNoon(dateKey)

    let savedCount = 0
    let updatedCount = 0

    for (const rec of records) {
      const player = await prisma.player.findUnique({ where: { id: rec.playerId } })
      if (!player || player.tenantId !== profile.tenantId) continue

      const sport = await prisma.sport.findUnique({ where: { id: rec.sportId } })
      if (!sport || sport.tenantId !== profile.tenantId) continue

      const playerSport = await prisma.playerSport.findFirst({ where: { playerId: rec.playerId, sportId: rec.sportId } })
      if (!playerSport) continue

      // البحث المباشر عن السجل في نفس اليوم والرياضة واللاعب
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          playerId: rec.playerId,
          sportId: rec.sportId,
          tenantId: profile.tenantId,
          dateKey,
        },
      })

      if (existingAttendance) {
        // إذا كان موجوداً مسبقاً، قم بتحديث حالته مباشرة دون أي أخطاء
        await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            present: rec.present,
            status: rec.present ? 'PRESENT' : 'ABSENT',
            date: targetDate,
          },
        })
        updatedCount++
      } else {
        // إذا لم يكن موجوداً، قم بإنشائه كجل جديد
        await prisma.attendance.create({
          data: {
            playerId: rec.playerId,
            sportId: rec.sportId,
            tenantId: profile.tenantId,
            date: targetDate,
            dateKey,
            present: rec.present,
            status: rec.present ? 'PRESENT' : 'ABSENT',
            recordedById: user.id,
          },
        })

        // خصم حصة من الاشتراكات النشطة في حال الحضور
        if (rec.present) {
          const activeSub = await prisma.subscription.findFirst({
            where: { playerId: rec.playerId, isStopped: false, remaining: { gt: 0 }, endDate: { gte: targetDate } },
            orderBy: { endDate: 'desc' },
          })
          if (activeSub) {
            await prisma.subscription.updateMany({
              where: { id: activeSub.id, remaining: { gt: 0 } },
              data: { remaining: { decrement: 1 } },
            })
          }
        }
        savedCount++
      }
    }

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Attendance',
      entityId: 'batch',
      details: `حفظ وتحديث الحضور ليوم ${dateKey} (${savedCount} سجل جديد، ${updatedCount} تحديث)`,
    })

    return NextResponse.json({ success: true, savedCount, skippedCount: 0, dateKey })
  } catch (err) {
    console.error('mark-attendance-batch error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة في الخادم أثناء الحفظ' }, { status: 500 })
  }
}