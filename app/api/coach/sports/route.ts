import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'COACH') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const coachSports = await prisma.coachSport.findMany({
    where: { coachId: profile.id },
    include: { sport: true },
  })

  return NextResponse.json({ sports: coachSports.map((cs) => ({ id: cs.sport.id, name: cs.sport.name })) })
}