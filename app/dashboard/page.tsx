import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { adminStyles as s } from '../admin/adminStyles'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile) {
    const player = await prisma.player.findUnique({ where: { userId: user.id } })
    if (player) {
      redirect('/player')
    }
    redirect('/login')
  }

  if (profile.role === 'ADMIN') {
    const totalPlayers = await prisma.player.count({
      where: { tenantId: profile.tenantId },
    })
    const totalCoaches = await prisma.profile.count({
      where: { tenantId: profile.tenantId, role: 'COACH' },
    })
    const totalRevenue = await prisma.payment.aggregate({
      where: { tenantId: profile.tenantId },
      _sum: { amount: true },
    })

    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const expiringSubs = await prisma.subscription.findMany({
      where: {
        tenantId: profile.tenantId,
        endDate: { lte: nextWeek, gte: new Date() },
      },
      include: { player: true },
    })

    return (
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>مرحبًا، {profile.fullName} 👑</h1>
            <p style={{ color: '#64748b', margin: 0 }}>لوحة تحكم المسؤول</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="card-hover" style={s.statCard}>
            <p style={s.statLabel}>👥 اللاعبون</p>
            <p style={s.statValue}>{totalPlayers}</p>
          </div>
          <div className="card-hover" style={s.statCard}>
            <p style={s.statLabel}>🏃 المدربون</p>
            <p style={s.statValue}>{totalCoaches}</p>
          </div>
          <div className="card-hover" style={s.statCard}>
            <p style={s.statLabel}>💰 الإيرادات</p>
            <p style={s.statValue}>{totalRevenue._sum.amount || 0} جنيه</p>
          </div>
        </div>

        <div style={{ marginTop: 28, background: '#fffbeb', border: '1px solid #d4af37', borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: '#92400e', margin: '0 0 12px' }}>⚠️ اشتراكات على وشك الانتهاء ({expiringSubs.length})</h3>
          {expiringSubs.length > 0 ? (
            <ul style={{ margin: 0, paddingRight: 20 }}>
              {expiringSubs.map((sub) => (
                <li key={sub.id} style={{ marginBottom: 6, color: '#78350f' }}>
                  {sub.player.fullName} — ينتهي في {new Date(sub.endDate).toLocaleDateString('ar-EG')}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#78350f', margin: 0 }}>لا توجد اشتراكات على وشك الانتهاء</p>
          )}
        </div>

        <h3 style={{ marginTop: 36, marginBottom: 4, color: '#0f172a', fontSize: 20 }}>الإجراءات السريعة</h3>
        <div style={s.actionGrid}>
          <a href="/admin/add-payment" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>💵</span>
            تسجيل دخل جديد
          </a>
          <a href="/admin/add-player" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>➕</span>
            إضافة لاعب
          </a>
          <a href="/admin/add-coach" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>🏋️</span>
            إضافة مدرب
          </a>
          <a href="/admin/sports" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>🏅</span>
            الرياضات
          </a>
          <a href="/admin/inventory" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>📦</span>
            المخزون
          </a>
          <a href="/admin/subscriptions" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>📅</span>
            تجديد الاشتراكات
          </a>
          <a href="/admin/search" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>🔍</span>
            البحث
          </a>
        </div>
      </div>
    )
  }

  if (profile.role === 'COACH') {
    const myPlayers = await prisma.player.findMany({
      where: { coachId: profile.id },
      include: {
        subscriptions: {
          orderBy: { endDate: 'desc' },
          take: 1,
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 3,
        },
      },
    })

    return (
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>مرحبًا أيها المدرب {profile.fullName} 🏃</h1>
            <p style={{ color: '#64748b', margin: 0 }}>فريقك ({myPlayers.length} لاعبًا)</p>
          </div>
        </div>

        <div style={s.actionGrid}>
          <a href="/coach/add-player" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>➕</span>
            إضافة لاعب
          </a>
          <a href="/coach/search" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>🔍</span>
            البحث عن لاعب
          </a>
          <a href="/coach/subscriptions" className="action-card" style={s.actionCard}>
            <span style={{ fontSize: 26 }}>📅</span>
            متابعة الاشتراكات
          </a>
        </div>

        <h3 style={{ marginTop: 36, marginBottom: 16, color: '#0f172a', fontSize: 20 }}>لاعبوك</h3>
        <div>
          {myPlayers.length > 0 ? (
            myPlayers.map((p) => {
              const sub = p.subscriptions[0]
              const daysLeft = sub
                ? Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null

              const subWarning = sub && (sub.remaining <= 2 || (daysLeft !== null && daysLeft <= 7))

              const medicalWarning = p.medicalCheckExpiry
                ? Math.ceil((new Date(p.medicalCheckExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30
                : false

              const last3Absent = p.attendances.length === 3 && p.attendances.every((a) => !a.present)

              return (
                <a
                  key={p.id}
                  href={`/coach/update/${p.id}`}
                  className="card-hover"
                  style={{ display: 'block', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, marginBottom: 12, color: '#0f172a', textDecoration: 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>{p.fullName}</span>
                    <span>←</span>
                  </div>

                  {subWarning && (
                    <p style={{ color: '#b91c1c', margin: '4px 0 0', fontSize: 14 }}>
                      🔴 الاشتراك على وشك الانتهاء
                    </p>
                  )}
                  {medicalWarning && (
                    <p style={{ color: '#c2410c', margin: '4px 0 0', fontSize: 14 }}>
                      🟠 الكشف الطبي على وشك الانتهاء
                    </p>
                  )}
                  {last3Absent && (
                    <p style={{ color: '#b91c1c', margin: '4px 0 0', fontSize: 14 }}>
                      🔴 تغيّب عن آخر ثلاث حصص متتالية
                    </p>
                  )}
                </a>
              )
            })
          ) : (
            <p>لا يوجد لاعبون مسجّلون في فريقك حتى الآن</p>
          )}
        </div>
      </div>
    )
  }

  return <p style={{ fontFamily: "'Tajawal', sans-serif", padding: 40 }}>لا تملك صلاحية للدخول إلى هذه الصفحة</p>
}