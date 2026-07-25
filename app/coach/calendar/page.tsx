import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import CalendarView from '../../calendar/CalendarView'

export default async function CoachCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'COACH') redirect('/dashboard')

  const coachSports = await prisma.coachSport.findMany({
    where: { coachId: profile.id },
    select: { sportId: true },
  })
  const sportIds = coachSports.map((cs) => cs.sportId)

  const events = await prisma.event.findMany({
    where: {
      tenantId: profile.tenantId,
      OR: [{ sportId: { in: sportIds } }, { sportId: null }],
    },
    include: { sport: true },
    orderBy: { date: 'asc' },
  })

  const formattedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    date: e.date.toISOString(),
    time: e.time,
    location: e.location,
    category: e.category,
    notes: e.notes,
    sportName: e.sport?.name || null,
  }))

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ color: '#f8fafc', fontFamily: "'Tajawal', sans-serif", marginBottom: 4 }}>التقويم</h1>
        <p style={{ color: '#94a3b8', fontFamily: "'Tajawal', sans-serif", marginBottom: 24 }}>
          مواعيد رياضاتك وأحداث الأكاديمية العامة
        </p>
        <CalendarView events={formattedEvents} canManage={false} sports={[]} />
      </div>
    </div>
  )
}