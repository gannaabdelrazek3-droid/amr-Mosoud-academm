import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import WeightChart from './WeightChart'
import SkillsRadarChart from './SkillsRadarChart'
import SignOutButtonGeneric from '../SignOutButtonGeneric'

interface SkillRatingRelation {
  skillId: string
  value: number
  skill: {
    name: string
  }
}

interface WeightLogRecord {
  date: Date | string
  weightKg: number
}

interface TournamentRecord {
  id: string
  name: string
  year: number
  result?: string | null
}

interface SubscriptionRecord {
  remaining: number
  totalSessions: number
  endDate: Date | string
}

export default async function PlayerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawPlayer = await prisma.player.findUnique({
    where: { userId: user.id },
    include: {
      subscriptions: { orderBy: { endDate: 'desc' }, take: 1 },
      tournaments: { orderBy: { year: 'desc' } },
      attendances: true,
      weightLogs: { orderBy: { date: 'asc' } },
      skillRatings: {
        include: { skill: true },
        orderBy: { date: 'desc' },
      },
    },
  })

  if (!rawPlayer) {
    redirect('/login')
  }

  const player = rawPlayer as typeof rawPlayer & {
    subscriptions: SubscriptionRecord[]
    weightLogs: WeightLogRecord[]
    skillRatings: SkillRatingRelation[]
    tournaments: TournamentRecord[]
    avatar_url?: string | null
    current_belt?: string | null
    target_belt?: string | null
  }

  const activeSubscription = player.subscriptions[0] ?? null
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
    if (r.skill && !latestSkillsMap.has(r.skillId)) {
      latestSkillsMap.set(r.skillId, { name: r.skill.name, value: r.value })
    }
  }
  const skillsData = Array.from(latestSkillsMap.values())

  const pageStyle = {
    maxWidth: 560,
    margin: '0 auto',
    fontFamily: "'Tajawal', sans-serif",
    padding: '32px 20px',
    color: '#e2e8f0',
    minHeight: '100vh',
  }
  
  const cardStyle = {
    background: 'rgba(30,41,59,0.6)',
    border: '1px solid rgba(212,175,55,0.25)',
    borderRadius: 16,
    padding: 22,
    marginTop: 20,
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={pageStyle}>
        
        {/* رأس الصفحة وصورة اللاعب */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img 
              src={player.avatar_url || "https://www.w3schools.com/howto/img_avatar.png"} 
              alt={player.fullName} 
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4af37' }}
            />
            <div>
              <h1 style={{ color: '#f8fafc', margin: 0, fontSize: 22 }}>أهلًا بك، {player.fullName} 👋</h1>
              <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 13 }}>لوحة متابعة اللاعب الشخصية</p>
            </div>
          </div>
          <SignOutButtonGeneric />
        </div>

        {/* كارت معلومات الأحزمة الجديد */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(30,41,59,0.6) 100%)' }}>
          <h3 style={{ color: '#d4af37', margin: '0 0 12px' }}>🥋 تفاصيل الأحزمة</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <span style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>الحزام الحالي</span>
              <strong style={{ color: '#f8fafc', fontSize: 16 }}>{player.current_belt || "غير محدد"}</strong>
            </div>
            <div style={{ borderLeft: '1px solid rgba(212,175,55,0.2)' }}></div>
            <div>
              <span style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>الحزام المطلوب</span>
              <strong style={{ color: '#34d399', fontSize: 16 }}>{player.target_belt || "غير محدد"}</strong>
            </div>
          </div>
        </div>

        <a
          href="/player/calendar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 16,
            padding: '14px 20px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: 12,
            color: '#d4af37',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: 20 }}>📅</span>
          عرض التقويم ومواعيد الأكاديمية
        </a>

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
            <ul style={{ margin: 0, paddingRight: 20 }}>
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