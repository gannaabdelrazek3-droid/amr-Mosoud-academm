import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const coachId = req.nextUrl.searchParams.get('coachId') || ''
    const sportId = req.nextUrl.searchParams.get('sportId') || ''
    const month = parseInt(req.nextUrl.searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(req.nextUrl.searchParams.get('year') || String(new Date().getFullYear()))
    const todayDate = req.nextUrl.searchParams.get('todayDate')

    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`
    const daysInMonth = new Date(year, month, 0).getDate()

    const players = await prisma.player.findMany({
      where: {
        tenantId: profile.tenantId,
        ...(coachId ? { coachId } : {}),
        ...(sportId ? { sports: { some: { sportId } } } : {}),
      },
      include: { coach: { select: { fullName: true } }, sports: { include: { sport: true } } },
      orderBy: { fullName: 'asc' },
    })

    const playerIds = players.map((p) => p.id)

    const records = await prisma.attendance.findMany({
      where: {
        tenantId: profile.tenantId,
        playerId: { in: playerIds },
        dateKey: { startsWith: monthPrefix },
        ...(sportId ? { sportId } : {}),
      },
    })

    const matrix = players.map((p) => {
      const days: Record<number, string> = {}
      records 
        .filter((r) => r.playerId === p.id)
        .forEach((r) => {
          const day = parseInt(r.dateKey?.split('-')[2] ?? '0', 10)
          days[day] = r.present ? 'PRESENT' : 'ABSENT'
        })

      const presentCount = Object.values(days).filter((s) => s === 'PRESENT').length
      const absentCount = Object.values(days).filter((s) => s === 'ABSENT').length
      const totalMarked = presentCount + absentCount
      const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0

      return {
        playerId: p.id,
        playerName: p.fullName,
        coachName: p.coach?.fullName || 'بدون مدرب',
        sports: p.sports.map((ps) => ps.sport.name),
        days,
        presentCount,
        absentCount,
        attendanceRate,
      }
    })

    let todayPresent = 0
    let todayAbsent = 0
    let todayDay: number | null = null

    if (todayDate && todayDate.startsWith(monthPrefix)) {
      todayDay = parseInt(todayDate.split('-')[2], 10)
      matrix.forEach((m) => {
        const status = m.days[todayDay as number]
        if (status === 'PRESENT') todayPresent++
        else if (status === 'ABSENT') todayAbsent++
      })
    }

    return NextResponse.json({ matrix, daysInMonth, todayPresent, todayAbsent, todayDay })
  } catch (err) {
    console.error('attendance-matrix error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة في الخادم' }, { status: 500 })
  }
}