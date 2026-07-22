import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import WeightChart from './WeightChart'
import SkillsRadarChart from './SkillsRadarChart'

const prisma = new PrismaClient()

export default async function PlayerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const player = await prisma.player.findUnique({
    where: { userId: user.id },
    include: {
      subscriptions: { orderBy: { endDate: 'desc' }, take: 1 },
      tournaments: { orderBy: { year: 'desc' } },
      attendances: true,
      weightLogs: { orderBy: { date: 'asc' } },
      skillRatings: { include: { skill: true }, orderBy: { date: 'desc' } },
    },
  })

  if (!player) redirect('/login')

  const activeSubscription = player.subscriptions[0]
  const daysLeft = activeSubscription
    ? Math.ceil((new Date(activeSubscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const attendedCount = player.attendances.filter((a) => a.present).length

  const trainingSince = player.joinDate
    ? Math.floor((Date.now() - new Date(player.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null

  const weightData = player.weightLogs.map((w) => ({
    date: new Date(w.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
    weight: w.weightKg,
  }))

  const latestSkillsMap = new Map<string, { name: string; value: number }>()
  for (const r of player.skillRatings) {
    if (!latestSkillsMap.has(r.skillId)) {
      latestSkillsMap.set(r.skillId, { name: r.skill.name, value: r.value })
    }
  }
  const skillsData = Array.from(latestSkillsMap.values())

  const pageStyle = { maxWidth: 560, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0', minHeight: '100vh' }
  const cardStyle = { background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 16, padding: 22, marginTop: 20 }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={pageStyle}>
        <h1 style={{ color: '#f8fafc' }}>أهلًا بك، {player.fullName} 👋</h1>

        <div style={cardStyle}>
          <h3 style={{ color: '#d4af37', margin: '0 0 10px' }}>📊 الاشتراك</h3>
          {activeSubscription ? (
            <>
              <p>الحصص المتبقية: <strong>{activeSubscription.remaining}</strong> من {activeSubscription.totalSessions}</p>
              <p style={{ color: daysLeft !== null && daysLeft <= 7 ? '#fca5a5' : '#e2e8f0' }}>
                باقٍ على الانتهاء: <strong>{daysLeft} يوم</strong>
              </p>
            </>
          ) : (
            <p>لا يوجد اشتراك نشط حاليًا</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: '#d4af37', margin: '0 0 10px' }}>🏋️ التمرين</h3>
          <p>عدد التمارين التي حضرتها: <strong>{attendedCount}</strong></p>
          {trainingSince !== null && <p>تتمرن معنا منذ: <strong>{trainingSince} شهرًا</strong></p>}
        </div>

        {skillsData.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ color: '#d4af37', margin: '0 0 10px' }}>🎯 مستواك في المهارات</h3>
            <SkillsRadarChart data={skillsData} />
          </div>
        )}

        <div style={cardStyle}>
          <h3 style={{ color: '#d4af37', margin: '0 0 10px' }}>⚖️ تطور الوزن</h3>
          {weightData.length > 0 ? <WeightChart data={weightData} /> : <p>لا توجد أوزان مسجّلة بعد</p>}
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: '#d4af37', margin: '0 0 10px' }}>🏥 الكشف الطبي</h3>
          {player.medicalCheckExpiry ? (
            <p>ساري حتى: {new Date(player.medicalCheckExpiry).toLocaleDateString('ar-EG')}</p>
          ) : (
            <p style={{ color: '#facc15' }}>لم تُجر كشفًا طبيًا بعد</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: '#d4af37', margin: '0 0 10px' }}>🏆 البطولات</h3>
          {player.tournaments.length > 0 ? (
            <ul>
              {player.tournaments.map((t) => (
                <li key={t.id}>{t.name} ({t.year}) {t.result && `- ${t.result}`}</li>
              ))}
            </ul>
          ) : (
            <p>لا توجد بطولات مسجّلة بعد</p>
          )}
        </div>
      </div>
    </div>
  )
}