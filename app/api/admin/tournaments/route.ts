import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const tournaments = await prisma.tournamentEvent.findMany({
      where: { tenantId: profile.tenantId },
      include: { media: true, participants: true },
      orderBy: [{ displayOrder: 'asc' }, { date: 'desc' }],
    })

    return NextResponse.json({ tournaments })
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

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'معرف البطولة مطلوب' }, { status: 400 })

    const tournament = await prisma.tournamentEvent.findUnique({ where: { id } })
    if (!tournament) return NextResponse.json({ error: 'البطولة غير موجودة' }, { status: 404 })

    await prisma.tournamentEvent.delete({ where: { id } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'TournamentEvent',
      entityId: id,
      details: `حذف البطولة: ${tournament.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const { id, isActive } = body
    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const tournament = await prisma.tournamentEvent.findUnique({ where: { id } })
    if (!tournament) return NextResponse.json({ error: 'البطولة غير موجودة' }, { status: 404 })

    await prisma.tournamentEvent.update({ where: { id }, data: { isActive } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'UPDATE',
      entity: 'TournamentEvent',
      entityId: id,
      details: `${isActive ? 'إظهار' : 'إخفاء'} البطولة: ${tournament.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}