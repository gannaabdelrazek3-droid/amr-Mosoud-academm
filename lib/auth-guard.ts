import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

export async function requireRole(allowedRoles: Role[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'غير مصرح' }, { status: 401 }) }
  }

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })

  if (!profile || !allowedRoles.includes(profile.role)) {
    return { error: NextResponse.json({ error: 'غير مصرح' }, { status: 403 }) }
  }

  return { user, profile, error: null }
}

/**
 * =========== جدول الصلاحيات المرجعي ===========
 * ADMIN فقط: حذف لاعب/مدرب/بطولة، تغيير الصلاحيات، الإعدادات
 * ADMIN + SECRETARY: إضافة لاعب، تسجيل دخل، متابعة اشتراكات/حضور
 * ADMIN + COACH: عرض لاعبين، تسجيل حضور، ملاحظات، تغيير حزام، نتائج اختبارات
 * ADMIN + COACH + SECRETARY: عرض بيانات اللاعبين (بدون الإيرادات للمدرب)
 * ================================================
 */