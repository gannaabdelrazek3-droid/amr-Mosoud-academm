import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const addSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional().or(z.literal('')),
  displayOrder: z.number().optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const belts = await prisma.belt.findMany({
      where: { tenantId: profile.tenantId },
      orderBy: [{ displayOrder: 'asc' }],
    })

    return NextResponse.json({ belts })
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

    const { name, color, displayOrder } = parsed.data

    const belt = await prisma.belt.create({
      data: {
        tenantId: profile.tenantId,
        name,
        color: color || null,
        displayOrder: displayOrder ?? 0,
      },
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Belt',
      entityId: belt.id,
      details: `إضافة حزام جديد: ${name}`,
    })

    return NextResponse.json({ success: true, belt })
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
    const { id, name, color, isActive, displayOrder } = body
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

    const existing = await prisma.belt.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'الحزام غير موجود' }, { status: 404 })

    const belt = await prisma.belt.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(color !== undefined ? { color: color || null } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(displayOrder !== undefined ? { displayOrder } : {}),
      },
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'UPDATE',
      entity: 'Belt',
      entityId: id,
      details: `تعديل الحزام: ${belt.name}`,
    })

    return NextResponse.json({ success: true, belt })
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

    const belt = await prisma.belt.findUnique({ where: { id } })
    if (!belt) return NextResponse.json({ error: 'الحزام غير موجود' }, { status: 404 })

    await prisma.belt.delete({ where: { id } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'Belt',
      entityId: id,
      details: `حذف الحزام: ${belt.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}