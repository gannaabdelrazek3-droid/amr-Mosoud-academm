import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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

    const pageStyle = {
      maxWidth: 700,
      margin: '40px auto',
      fontFamily: "'Tajawal', system-ui, sans-serif",
      padding: 32,
      background: '#ffffff',
      color: '#1a1a2e',
      borderRadius: 16,
      boxShadow: '0 2px 16px rgba(30, 58, 138, 0.06)',
    }

    const cardStyle = {
      flex: 1,
      background: '#f3f6fb',
      borderRadius: 14,
      padding: 22,
    }

    const linkStyle = {
      padding: '12px 22px',
      background: '#1e3a8a',
      color: '#fff',
      borderRadius: 10,
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: 15,
    }

    return (
      <div style={pageStyle}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e3a8a', marginBottom: 4 }}>
          مرحبًا، {profile.fullName} 👑
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 4 }}>لوحة تحكم المسؤول</p>

        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <div className="card-hover" style={cardStyle}>
            <h3 style={{ color: '#374151' }}>👥 اللاعبون</h3>
            <p style={{ fontSize: 30, fontWeight: 900, color: '#1e3a8a' }}>{totalPlayers}</p>
          </div>
          <div className="card-hover" style={cardStyle}>
            <h3 style={{ color: '#374151' }}>🏃 المدربون</h3>
            <p style={{ fontSize: 30, fontWeight: 900, color: '#1e3a8a' }}>{totalCoaches}</p>
          </div>
          <div className="card-hover" style={cardStyle}>
            <h3 style={{ color: '#374151' }}>💰 الإيرادات</h3>
            <p style={{ fontSize: 30, fontWeight: 900, color: '#1e3a8a' }}>{totalRevenue._sum.amount || 0} جنيه</p>
          </div>
        </div>

        <div style={{ marginTop: 24, background: '#fef8f0', border: '1px solid #fde3c8', borderRadius: 14, padding: 22 }}>
          <h3 style={{ color: '#92400e' }}>⚠️ اشتراكات على وشك الانتهاء ({expiringSubs.length})</h3>
          {expiringSubs.length > 0 ? (
            <ul style={{ marginTop: 10 }}>
              {expiringSubs.map((s) => (
                <li key={s.id} style={{ marginBottom: 6 }}>
                  {s.player.fullName} — ينتهي في {new Date(s.endDate).toLocaleDateString('ar-EG')}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#92400e', marginTop: 10 }}>لا توجد اشتراكات على وشك الانتهاء</p>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          
          <a href="/admin/add-player" className="btn-primary" style={linkStyle}>
            + إضافة لاعب
          </a>
          <a href="/admin/add-coach" className="btn-primary" style={linkStyle}>
            + إضافة مدرب
          </a>
          <a href="/admin/sports" className="btn-primary" style={linkStyle}>
            🏅 الرياضات
          </a>
          <a href="/admin/inventory" className="btn-primary" style={linkStyle}>
            📦 المخزون
          </a>
          <a href="/admin/subscriptions" className="btn-primary" style={linkStyle}>
            📅 تجديد الاشتراكات
          </a>
          <a href="/admin/search" className="btn-primary" style={linkStyle}>
            🔍 البحث
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

    const pageStyle = {
      maxWidth: 700,
      margin: '40px auto',
      fontFamily: "'Tajawal', system-ui, sans-serif",
      padding: 32,
      background: '#ffffff',
      color: '#1a1a2e',
      borderRadius: 16,
      boxShadow: '0 2px 16px rgba(30, 58, 138, 0.06)',
    }

    const linkStyle = {
      padding: '12px 22px',
      background: '#1e3a8a',
      color: '#fff',
      borderRadius: 10,
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: 15,
    }

    return (
      <div style={pageStyle}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e3a8a', marginBottom: 4 }}>
          مرحبًا أيها المدرب {profile.fullName} 🏃
        </h1>
        <p style={{ color: '#6b7280' }}>فريقك ({myPlayers.length} لاعبًا)</p>

        <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <a href="/coach/add-player" className="btn-primary" style={linkStyle}>
            + إضافة لاعب
          </a>
          <a href="/coach/search" className="btn-primary" style={linkStyle}>
            🔍 البحث عن لاعب
          </a>
          <a href="/coach/subscriptions" className="btn-primary" style={linkStyle}>
            📅 متابعة الاشتراكات
          </a>
        </div>

        <div style={{ marginTop: 24 }}>
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
                  style={{ display: 'block', background: '#f3f6fb', borderRadius: 14, padding: 18, marginBottom: 12, color: '#1a1a2e', textDecoration: 'none' }}
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

  return <p>لا تملك صلاحية للدخول إلى هذه الصفحة</p>
}