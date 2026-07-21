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

  const coachId = req.nextUrl.searchParams.get('coachId')

  if (!coachId) {
    return NextResponse.json({ error: 'coachId مطلوب' }, { status: 400 })
  }

  const coach = await prisma.profile.findUnique({
    where: { id: coachId },
  })

  if (!coach) {
    return NextResponse.json({ error: 'المدرب غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ coach })
}