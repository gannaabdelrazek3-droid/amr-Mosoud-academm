import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const addSchema = z.object({
  name: z.string().min(1),
  displayOrder: z.number().optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const sports = await prisma.sport.findMany({
      where: { tenantId: profile.tenantId },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ sports })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const parsed = addSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })

    const { name, displayOrder } = parsed.data

    const sport = await prisma.sport.create({
      data: {
        tenantId: profile.tenantId,
        name,
        displayOrder: displayOrder ?? 0,
      },
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Sport',
      entityId: sport.id,
      details: `إضافة نشاط جديد: ${name}`,
    })

    return NextResponse.json({ success: true, sport })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await req.json()
    const { id, name, isActive, displayOrder } = body
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

    const existing = await prisma.sport.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'النشاط غير موجود' }, { status: 404 })

    const sport = await prisma.sport.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(displayOrder !== undefined ? { displayOrder } : {}),
      },
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'UPDATE',
      entity: 'Sport',
      entityId: id,
      details: `تعديل النشاط: ${sport.name}`,
    })

    return NextResponse.json({ success: true, sport })
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
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

    const sport = await prisma.sport.findUnique({ where: { id } })
    if (!sport) return NextResponse.json({ error: 'النشاط غير موجود' }, { status: 404 })

    await prisma.sport.delete({ where: { id } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'Sport',
      entityId: id,
      details: `حذف النشاط: ${sport.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error(err)
    const message =
      typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2003'
        ? 'لا يمكن حذف هذا النشاط لوجود بيانات مرتبطة به (لاعبين أو مدربين). يمكنك إخفاءه بدلاً من الحذف.'
        : 'حدثت مشكلة، حاول مرة أخرى'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}