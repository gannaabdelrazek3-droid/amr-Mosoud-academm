import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const body = await req.json()
  const { title, type, date, time, location, category, notes, sportId } = body

  if (!title || !type || !date) {
    return NextResponse.json({ error: 'برجاء ملء البيانات الأساسية' }, { status: 400 })
  }

  await prisma.event.create({
    data: {
      tenantId: profile.tenantId,
      title,
      type,
      date: new Date(date),
      time: time || null,
      location: location || null,
      category: category || null,
      notes: notes || null,
      sportId: sportId || null,
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { eventId } = await req.json()

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || event.tenantId !== profile.tenantId) {
    return NextResponse.json({ error: 'الحدث غير موجود' }, { status: 404 })
  }

  await prisma.event.delete({ where: { id: eventId } })

  return NextResponse.json({ success: true })
}