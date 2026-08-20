import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SignOutButtonGeneric from '../SignOutButtonGeneric'
import WeightChart from './WeightChart'
import SkillsRadarChart from './SkillsRadarChart'

const pageStyle = { background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px' }
const cardStyle = { maxWidth: 800, margin: '0 auto 18px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16, padding: 24 }
const sectionTitle = { color: '#d4af37', fontSize: 16, fontWeight: 900, margin: '0 0 14px', paddingBottom: 8, borderBottom: '1px solid rgba(212,175,55,0.2)' }

export default async function PlayerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const player = await prisma.player.findUnique({
    where: { userId: user.id },
    include: {
      coach: { select: { fullName: true, phone: true } },
      sports: { include: { sport: true } },
      subscriptions: { orderBy: { endDate: 'desc' }, take: 1 },
      attendances: { orderBy: { date: 'desc' }, take: 30 },
      weightLogs: { orderBy: { date: 'asc' } },
      skillRatings: { include: { skill: true }, orderBy: { date: 'desc' } },
      tournaments: { include: { sport: true }, orderBy: { createdAt: 'desc' } },
      nutritionPlans: { orderBy: { createdAt: 'desc' } },
      trainingPlans: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!player) redirect('/login')

  const subscription = player.subscriptions[0] || null
  const now = new Date()
  const thisMonthAttendances = player.attendances.filter(
    (a) => new Date(a.date).getMonth() === now.getMonth() && new Date(a.date).getFullYear() === now.getFullYear()
  )
  const presentCount = thisMonthAttendances.filter((a) => a.present).length
  const absentCount = thisMonthAttendances.filter((a) => !a.present).length

  const weightData = player.weightLogs.map((w) => ({
    date: new Date(w.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
    weight: w.weightKg,
  }))

  const latestSkillsMap = new Map<string, { name: string; value: number; date: Date }>()
  player.skillRatings.forEach((sr) => {
    const existing = latestSkillsMap.get(sr.skillId)
    if (!existing || new Date(sr.date) > existing.date) {
      latestSkillsMap.set(sr.skillId, { name: sr.skill.name, value: Math.round(sr.value), date: new Date(sr.date) })
    }
  })
  const skillsData = Array.from(latestSkillsMap.values()).map((s) => ({ name: s.name, value: s.value }))

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 800, margin: '0 auto 24px', textAlign: 'center' as const }}>
        <div
          style={{
            width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px',
            border: '3px solid #d4af37', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {player.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.avatarUrl} alt={player.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 40, color: '#d4af37' }}>🥋</span>
          )}
        </div>
        <h1 style={{ color: '#f8fafc', margin: '0 0 4px' }}>{player.fullName}</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>مرحبًا بك في صفحتك الشخصية</p>
        <div style={{ marginTop: 14 }}>
          <SignOutButtonGeneric />
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Link href="/coaches" style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, gap: 6, padding: '16px 10px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: 13, textAlign: 'center' as const }}>
          <span style={{ fontSize: 22 }}>🥋</span> المدربون
        </Link>
        <Link href="/featured-players" style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, gap: 6, padding: '16px 10px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: 13, textAlign: 'center' as const }}>
          <span style={{ fontSize: 22 }}>⭐</span> اللاعبون المميزون
        </Link>
        <Link href="/#news" style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, gap: 6, padding: '16px 10px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: 13, textAlign: 'center' as const }}>
          <span style={{ fontSize: 22 }}>📰</span> أخبار الأكاديمية
        </Link>
        <Link href="/tournaments" style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, gap: 6, padding: '16px 10px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: 13, textAlign: 'center' as const }}>
          <span style={{ fontSize: 22 }}>🏆</span> بطولات الأكاديمية
        </Link>
        <Link href="/player/calendar" style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, gap: 6, padding: '16px 10px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: 13, textAlign: 'center' as const }}>
          <span style={{ fontSize: 22 }}>📅</span> التقويم
        </Link>
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>🥋 الأحزمة</h3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: 12.5, margin: '0 0 4px' }}>الحزام الحالي</p>
            <p style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16, margin: 0 }}>{player.currentBelt || 'لم يُحدَّد بعد'}</p>
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: 12.5, margin: '0 0 4px' }}>الحزام المطلوب</p>
            <p style={{ color: '#d4af37', fontWeight: 800, fontSize: 16, margin: 0 }}>{player.targetBelt || 'لم يُحدَّد بعد'}</p>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>📊 الاشتراك</h3>
        {subscription ? (
          <>
            <p style={{ color: '#e2e8f0', margin: '0 0 8px' }}>الحصص المتبقية: <strong style={{ color: '#d4af37' }}>{subscription.remaining}</strong> من {subscription.totalSessions}</p>
            <p style={{ color: '#e2e8f0', margin: '0 0 8px' }}>تاريخ الانتهاء: {new Date(subscription.endDate).toLocaleDateString('ar-EG')}</p>
            {Number(subscription.remainingAmount) > 0 && (
              <p style={{ color: '#ef4444', fontWeight: 700, margin: 0 }}>⚠️ متبقي عليك دفع: {Number(subscription.remainingAmount).toFixed(2)} جنيه</p>
            )}
          </>
        ) : (
          <p style={{ color: '#94a3b8', margin: 0 }}>لا يوجد اشتراك مسجّل حاليًا</p>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>✅ الحضور هذا الشهر</h3>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: '14px 22px', textAlign: 'center' as const }}>
            <p style={{ color: '#22c55e', fontSize: 24, fontWeight: 900, margin: 0 }}>{presentCount}</p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>أيام حضور</p>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '14px 22px', textAlign: 'center' as const }}>
            <p style={{ color: '#ef4444', fontSize: 24, fontWeight: 900, margin: 0 }}>{absentCount}</p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>أيام غياب</p>
          </div>
        </div>
      </div>

      {weightData.length > 0 && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>⚖️ تطور الوزن</h3>
          <WeightChart data={weightData} />
        </div>
      )}

      {skillsData.length > 0 && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>🎯 تقييم المهارات</h3>
          <SkillsRadarChart data={skillsData} />
        </div>
      )}

      {player.nutritionPlans.length > 0 && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>🥗 البرنامج الغذائي</h3>
          {player.nutritionPlans.map((np) => (
            <div key={np.id} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <strong style={{ color: '#f8fafc', fontSize: 14.5 }}>{np.title}</strong>
              <p style={{ color: '#94a3b8', fontSize: 13.5, margin: '8px 0 0', whiteSpace: 'pre-wrap' as const }}>{np.content}</p>
            </div>
          ))}
        </div>
      )}

      {player.trainingPlans.length > 0 && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>🏋️ البرنامج التدريبي</h3>
          {player.trainingPlans.map((tp) => (
            <div key={tp.id} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <strong style={{ color: '#f8fafc', fontSize: 14.5 }}>{tp.title}</strong>
              {tp.eventDate && <p style={{ color: '#d4af37', fontSize: 12, margin: '4px 0' }}>📅 {new Date(tp.eventDate).toLocaleDateString('ar-EG')}</p>}
              <p style={{ color: '#94a3b8', fontSize: 13.5, margin: '8px 0 0', whiteSpace: 'pre-wrap' as const }}>{tp.content}</p>
            </div>
          ))}
        </div>
      )}

      {player.tournaments.length > 0 && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>🏆 بطولاتي</h3>
          {player.tournaments.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(15,23,42,0.5)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              <span style={{ color: '#e2e8f0', fontSize: 13.5 }}>{t.name} ({t.sport.name}) — {t.year}</span>
              {t.result && <span style={{ color: '#d4af37', fontWeight: 700, fontSize: 13 }}>{t.result}</span>}
            </div>
          ))}
        </div>
      )}

      <div style={cardStyle}>
        <h3 style={sectionTitle}>🏋️ مدربي</h3>
        {player.coach ? (
          <>
            <p style={{ color: '#e2e8f0', margin: '0 0 6px' }}>{player.coach.fullName}</p>
            {player.coach.phone && <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>📞 {player.coach.phone}</p>}
          </>
        ) : (
          <p style={{ color: '#94a3b8', margin: 0 }}>لم يتم تحديد مدرب بعد</p>
        )}
        {player.sports.length > 0 && (
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 10 }}>الأنشطة: {player.sports.map((ps) => ps.sport.name).join('، ')}</p>
        )}
      </div>
    </div>
  )
}