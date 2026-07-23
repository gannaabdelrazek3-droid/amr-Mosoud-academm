import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const sportId = req.nextUrl.searchParams.get('sportId')

  if (!sportId) {
    return NextResponse.json({ error: 'sportId مطلوب' }, { status: 400 })
  }

  const skills = await prisma.skill.findMany({
    where: { sportId },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ skills })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  const { sportId, name } = await req.json()

  if (!sportId || !name) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  const skill = await prisma.skill.create({
    data: {
      sportId,
      name,
      tenantId: profile.tenantId,
    },
  })

  return NextResponse.json({ success: true, skill })
}