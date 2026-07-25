import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { requestId, action, coachId } = await req.json()

  const request = await prisma.registrationRequest.findUnique({ where: { id: requestId } })
  if (!request || request.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  if (action === 'approve') {
    if (!coachId) {
      return NextResponse.json({ error: 'يجب اختيار المدرب المسؤول' }, { status: 400 })
    }

    const coach = await prisma.profile.findUnique({ where: { id: coachId } })
    if (!coach || coach.tenantId !== profile.tenantId || coach.role !== 'COACH') {
      return NextResponse.json({ error: 'المدرب غير صالح' }, { status: 400 })
    }

    let sport = await prisma.sport.findFirst({
      where: { tenantId: profile.tenantId, name: request.sport },
    })
    if (!sport) {
      sport = await prisma.sport.create({
        data: { tenantId: profile.tenantId, name: request.sport },
      })
    }

    const player = await prisma.player.create({
      data: {
        tenantId: profile.tenantId,
        fullName: request.fullName,
        phone: request.phone,
        joinDate: new Date(),
        coachId: coach.id,
      },
    })

    await prisma.playerSport.create({
      data: { playerId: player.id, sportId: sport.id },
    })

    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: 'approved' },
    })
  } else {
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' },
    })
  }

  return NextResponse.json({ success: true })
}