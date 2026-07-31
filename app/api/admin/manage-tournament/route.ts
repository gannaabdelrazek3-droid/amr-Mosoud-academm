import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const tournamentSchema = z.object({
  playerId: z.string().min(1),
  sportId: z.string().optional().nullable(),
  name: z.string().min(1),
  year: z.union([z.string(), z.number()]),
  result: z.string().optional().nullable(),
})

const deleteSchema = z.object({
  tournamentId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COACH')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = tournamentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { playerId, sportId, name, year, result } = parsed.data

    const yearNum = Number(year)
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > 2100) {
      return NextResponse.json({ error: 'السنة غير صالحة' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
    }

    let targetSportId = sportId
    if (!targetSportId) {
      const defaultSport = await prisma.sport.findFirst({
        where: { tenantId: profile.tenantId }
      })
      if (!defaultSport) {
        return NextResponse.json({ error: 'يجب إضافة رياضة واحدة على الأقل في النظام أولاً' }, { status: 400 })
      }
      targetSportId = defaultSport.id
    } else {
      const sportCheck = await prisma.sport.findUnique({ where: { id: targetSportId } })
      if (!sportCheck || sportCheck.tenantId !== profile.tenantId) {
        return NextResponse.json({ error: 'الرياضة غير صالحة' }, { status: 400 })
      }
    }

    await prisma.tournament.create({
      data: {
        playerId,
        sportId: targetSportId,
        tenantId: profile.tenantId,
        name,
        year: yearNum,
        result: result || null,
      },
    } as any)

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Tournament',
      entityId: playerId,
      details: `إضافة بطولة "${name}" للالاعب ${player.fullName}`,
    })

    return NextResponse.json({ success: true })
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
    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COACH')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { tournamentId } = parsed.data

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
    if (!tournament || tournament.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 })
    }

    await prisma.tournament.delete({ where: { id: tournamentId } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'Tournament',
      entityId: tournamentId,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}