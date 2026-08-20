import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const sportId = req.nextUrl.searchParams.get('sportId')
    console.log('--- DEBUG SKILLS API --- sportId received:', sportId)

    if (!sportId) {
      return NextResponse.json({ error: 'معرف الرياضة مطلوب' }, { status: 400 })
    }

    // جلب كل المهارات للتأكد هل يوجد أي مهارات في الجدول أصلاً؟
    const allSkillsInDb = await prisma.skill.findMany()
    console.log('All skills in database:', allSkillsInDb.map(s => ({ name: s.name, sportId: s.sportId })))

    const skills = await prisma.skill.findMany({
      where: { sportId },
      orderBy: { createdAt: 'asc' },
    })

    console.log('Skills found for this sportId:', skills.length)

    return NextResponse.json({ skills })
  } catch (err) {
    console.error('skills GET error:', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}