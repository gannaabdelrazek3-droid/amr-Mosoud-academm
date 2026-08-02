import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

// جلب كل المدربين لجدول الإدارة
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const coaches = await prisma.profile.findMany({
      where: { tenantId: profile.tenantId, role: 'COACH' },
      include: {
        coachSports: { include: { sport: true } },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ coaches })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

// حذف مدرب
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const coachId = req.nextUrl.searchParams.get('id')
    if (!coachId) return NextResponse.json({ error: 'معرف المدرب مطلوب' }, { status: 400 })

    const coach = await prisma.profile.findUnique({ where: { id: coachId } })
    if (!coach || coach.role !== 'COACH') {
      return NextResponse.json({ error: 'المدرب غير موجود' }, { status: 404 })
    }

    await prisma.profile.delete({ where: { id: coachId } })

    // حذف حساب الدخول لو موجود
    try {
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await adminSupabase.auth.admin.deleteUser(coachId)
    } catch {
      // ممكن يكون المدرب اتعمله إنشاء بدون حساب دخول، نتجاهل الخطأ
    }

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'DELETE',
      entity: 'Coach',
      entityId: coachId,
      details: `حذف المدرب: ${coach.fullName}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}

// إخفاء / إظهار مدرب
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

    const coach = await prisma.profile.findUnique({ where: { id } })
    if (!coach || coach.role !== 'COACH') {
      return NextResponse.json({ error: 'المدرب غير موجود' }, { status: 404 })
    }

    await prisma.profile.update({ where: { id }, data: { isActive } })

    await logAudit({
      tenantId: profile.tenantId,
      userId: user.id,
      userRole: profile.role,
      action: 'UPDATE',
      entity: 'Coach',
      entityId: id,
      details: `${isActive ? 'إظهار' : 'إخفاء'} المدرب: ${coach.fullName}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}