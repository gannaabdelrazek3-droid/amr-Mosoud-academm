import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح - لم يتم تسجيل الدخول' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COACH')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const playerId = req.nextUrl.searchParams.get('playerId')
    if (!playerId) return NextResponse.json({ error: 'معرف اللاعب مطلوب' }, { status: 400 })

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
    }
    if (profile.role === 'COACH' && player.coachId !== profile.id) {
      return NextResponse.json({ error: 'اللاعب ليس ضمن فريقك' }, { status: 403 })
    }

    const plans = await prisma.playerNutritionPlan.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ plans })
  } catch (err) {
    console.error('nutrition-plans GET error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة في الخادم أثناء جلب البرامج الغذائية' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح - لم يتم تسجيل الدخول' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    // ✅ الإضافة مقصورة على الأدمن فقط
    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'إضافة البرنامج الغذائي متاحة للأدمن فقط' }, { status: 403 })
    }

    const body = await req.json()
    const { playerId, title, content } = body

    if (!playerId || !title || !content) {
      return NextResponse.json({ error: 'يجب إدخال العنوان والتفاصيل' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player || player.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'اللاعب غير موجود' }, { status: 404 })
    }

    const plan = await prisma.playerNutritionPlan.create({
      data: {
        tenantId: profile.tenantId,
        playerId,
        title,
        content,
        createdByRole: profile.role,
      },
    })

    return NextResponse.json({ success: true, plan })
  } catch (err) {
    console.error('nutrition-plans POST error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة في الخادم أثناء حفظ البرنامج الغذائي' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح - لم يتم تسجيل الدخول' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    // ✅ الحذف مقصور على الأدمن فقط
    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'حذف البرنامج الغذائي متاح للأدمن فقط' }, { status: 403 })
    }

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

    const plan = await prisma.playerNutritionPlan.findUnique({ where: { id } })
    if (!plan || plan.tenantId !== profile.tenantId) {
      return NextResponse.json({ error: 'البرنامج غير موجود' }, { status: 404 })
    }

    await prisma.playerNutritionPlan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('nutrition-plans DELETE error:', err)
    return NextResponse.json({ error: 'حدثت مشكلة في الخادم أثناء الحذف' }, { status: 500 })
  }
}