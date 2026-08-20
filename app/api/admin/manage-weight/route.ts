import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const { playerId, sportId, weightKg } = body

    if (!playerId || !sportId || !weightKg) {
      return NextResponse.json({ error: 'يجب اختيار رياضة وإدخال الوزن' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
    }

    const sport = await prisma.sport.findUnique({ where: { id: sportId } })
    if (!sport || sport.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'الرياضة غير صالحة' }, { status: 400 })
    }

    const parsedWeight = parseFloat(weightKg)
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return NextResponse.json({ error: 'قيمة الوزن غير صحيحة' }, { status: 400 })
    }

    const log = await prisma.weightLog.create({
      data: { playerId, sportId, tenantId: profile.tenantId, weightKg: parsedWeight },
    })

    return NextResponse.json({ success: true, log })
  } catch (err) {
    console.error('manage-weight error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة أثناء حفظ الوزن في الخادم' }, { status: 500 })
  }
}