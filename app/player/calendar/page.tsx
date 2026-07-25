import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import CalendarView from '../../calendar/CalendarView'

export default async function PlayerCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const player = await prisma.player.findUnique({ where: { userId: user.id } })
  if (!player) redirect('/login')

  const playerSports = await prisma.playerSport.findMany({
    where: { playerId: player.id },
    select: { sportId: true },
  })
  const sportIds = playerSports.map((ps) => ps.sportId)

  const events = await prisma.event.findMany({
    where: {
      tenantId: player.tenantId,
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
          مواعيدك وأحداث الأكاديمية العامة
        </p>
        <CalendarView events={formattedEvents} canManage={false} sports={[]} />
      </div>
    </div>
  )
}