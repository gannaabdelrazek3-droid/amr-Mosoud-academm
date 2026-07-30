import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const weightSchema = z.object({
  playerId: z.string().min(1),
  sportId: z.string().min(1),
  weightKg: z.union([z.string(), z.number()]),
  date: z.string().optional(),
})

const deleteSchema = z.object({
  weightId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = weightSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { playerId, sportId, weightKg, date } = parsed.data

    const weightNum = Number(weightKg)
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 400) {
      return NextResponse.json({ error: 'الوزن غير صالح' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
    }

    const sportCheck = await prisma.sport.findUnique({ where: { id: sportId } })
    if (!sportCheck || sportCheck.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'الرياضة غير صالحة' }, { status: 400 })
    }

    await prisma.weightLog.create({
      data: {
        playerId,
        sportId,
        tenantId: profile.tenantId,
        weightKg: weightNum,
        date: date ? new Date(date) : new Date(),
      },
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'WeightLog',
      entityId: playerId,
      details: `تسجيل وزن ${weightNum} كجم للاعب ${player.fullName}`,
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
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const { weightId } = parsed.data

    const weight = await prisma.weightLog.findUnique({ where: { id: weightId } })
    if (!weight || weight.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 })
    }

    await prisma.weightLog.delete({ where: { id: weightId } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'WeightLog',
      entityId: weightId,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}