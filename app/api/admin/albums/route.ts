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

    const albums = await prisma.mediaAlbum.findMany({
      where: { tenantId: profile.tenantId },
      include: { items: true },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    })

    return NextResponse.json({ albums })
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
    if (!id) return NextResponse.json({ error: 'معرف الألبوم مطلوب' }, { status: 400 })

    const album = await prisma.mediaAlbum.findUnique({ where: { id } })
    if (!album) return NextResponse.json({ error: 'الألبوم غير موجود' }, { status: 404 })

    await prisma.mediaAlbum.delete({ where: { id } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'MediaAlbum',
      entityId: id,
      details: `حذف الألبوم: ${album.title}`,
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

    const album = await prisma.mediaAlbum.findUnique({ where: { id } })
    if (!album) return NextResponse.json({ error: 'الألبوم غير موجود' }, { status: 404 })

    await prisma.mediaAlbum.update({ where: { id }, data: { isActive } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'UPDATE',
      entity: 'MediaAlbum',
      entityId: id,
      details: `${isActive ? 'إظهار' : 'إخفاء'} الألبوم: ${album.title}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}