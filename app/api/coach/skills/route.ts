import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const sportId = req.nextUrl.searchParams.get('sportId')
  if (!sportId) return NextResponse.json({ error: 'الرياضة مفقودة' }, { status: 400 })

  const coachSport = await prisma.coachSport.findFirst({ where: { coachId: profile.id, sportId } })
  if (!coachSport) return NextResponse.json({ error: 'هذه الرياضة ليست ضمن رياضاتك' }, { status: 403 })

  const skills = await prisma.skill.findMany({
    where: { tenantId: profile.tenantId, sportId },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ skills })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { sportId, name } = await req.json()
  if (!sportId || !name) return NextResponse.json({ error: 'برجاء ملء البيانات' }, { status: 400 })

  const coachSport = await prisma.coachSport.findFirst({ where: { coachId: profile.id, sportId } })
  if (!coachSport) return NextResponse.json({ error: 'هذه الرياضة ليست ضمن رياضاتك' }, { status: 403 })

  await prisma.skill.create({
    data: { tenantId: profile.tenantId, sportId, name },
  })

  return NextResponse.json({ success: true })
}