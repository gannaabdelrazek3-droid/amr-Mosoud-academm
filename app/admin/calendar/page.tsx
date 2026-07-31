import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'
import CalendarView from '../../calendar/CalendarView'
import { EventType } from '@prisma/client'

export default async function AdminCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') redirect('/dashboard')

  const events = await prisma.event.findMany({
    where: { tenantId: profile.tenantId },
    include: { sport: true },
    orderBy: { date: 'asc' },
  })

  const sports = await prisma.sport.findMany({
    where: { tenantId: profile.tenantId },
    select: { id: true, name: true },
  })

  const formattedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type as EventType,
    date: e.date.toISOString(),
    time: e.time,
    location: e.location,
    category: e.category,
    notes: e.notes,
    sportName: e.sport?.name || null,
  }))

  return (
    <AdminShell fullName={profile.fullName}>
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>التقويم</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>كل مواعيد وأحداث الأكاديمية في مكان واحد</p>
          </div>
        </div>

        <CalendarView events={formattedEvents} canManage={true} sports={sports} />
      </div>
    </AdminShell>
  )
}