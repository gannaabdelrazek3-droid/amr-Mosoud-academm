import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const addSchema = z.object({
  sportId: z.string().min(1),
  name: z.string().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const sportId = req.nextUrl.searchParams.get('sportId')
    if (!sportId) return NextResponse.json({ error: 'معرف الرياضة مطلوب' }, { status: 400 })

    const skills = await prisma.skill.findMany({
      where: { sportId, tenantId: profile.tenantId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ skills })
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

    const { sportId, name } = parsed.data

    const sport = await prisma.sport.findUnique({ where: { id: sportId } })
    if (!sport || sport.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'الرياضة غير موجودة' }, { status: 404 })
    }

    const skill = await prisma.skill.create({
      data: {
        sportId,
        tenantId: profile.tenantId,
        name,
      },
    })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'CREATE',
      entity: 'Skill',
      entityId: skill.id,
      details: `إضافة مهارة "${name}" لرياضة "${sport.name}"`,
    })

    return NextResponse.json({ success: true, skill })
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
    const { id, name } = body
    if (!id || !name) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })

    const existing = await prisma.skill.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'المهارة غير موجودة' }, { status: 404 })
    }

    const skill = await prisma.skill.update({ where: { id }, data: { name } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'UPDATE',
      entity: 'Skill',
      entityId: id,
      details: `تعديل مهارة إلى "${name}"`,
    })

    return NextResponse.json({ success: true, skill })
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

    const skill = await prisma.skill.findUnique({ where: { id } })
    if (!skill || skill.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'المهارة غير موجودة' }, { status: 404 })
    }

    await prisma.skill.delete({ where: { id } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'Skill',
      entityId: id,
      details: `حذف مهارة "${skill.name}"`,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error(err)
    const message =
      typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2003'
        ? 'لا يمكن حذف هذه المهارة لوجود تقييمات مرتبطة بها.'
        : 'حدثت مشكلة، حاول مرة أخرى'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}