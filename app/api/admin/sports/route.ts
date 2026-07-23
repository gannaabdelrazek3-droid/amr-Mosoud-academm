import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 401 })
  }

  const sports = await prisma.sport.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ sports })
}