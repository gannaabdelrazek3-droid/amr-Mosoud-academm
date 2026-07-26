import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { ratingId } = await req.json()

  const rating = await prisma.skillRating.findUnique({ where: { id: ratingId } })
  if (!rating || rating.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'التقييم غير موجود' }, { status: 404 })
  }

  await prisma.skillRating.delete({ where: { id: ratingId } })

  return NextResponse.json({ success: true })
}