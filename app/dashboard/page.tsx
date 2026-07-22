import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { adminStyles as s } from '../admin/adminStyles'
import AdminShell from '../admin/AdminShell'
import DashboardCharts from './DashboardCharts'

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

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)

    const recentPayments = await prisma.payment.findMany({
      where: { tenantId: profile.tenantId, date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    })

    const monthlyRevenue: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = d.toLocaleDateString('ar-EG', { month: 'short' })
      monthlyRevenue[key] = 0
    }
    recentPayments.forEach((p) => {
      const key = new Date(p.date).toLocaleDateString('ar-EG', { month: 'short' })
      if (monthlyRevenue[key] !== undefined) {
        monthlyRevenue[key] += p.amount
      }
    })
    const revenueChartData = Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount }))

    const allSubs = await prisma.subscription.findMany({
      where: { tenantId: profile.tenantId },
      orderBy: { endDate: 'desc' },
    })
    const now = new Date()
    let active = 0
    let expiringSoon = 0
    let expired = 0
    const seenPlayers = new Set<string>()
    for (const sub of allSubs) {
      if (seenPlayers.has(sub.playerId)) continue
      seenPlayers.add(sub.playerId)
      const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft < 0) expired++
      else if (daysLeft <= 7) expiringSoon++
      else active++
    }
    const statusChartData = [
      { name: 'نشط', value: active, color: '#22c55e' },
      { name: 'قرب الانتهاء', value: expiringSoon, color: '#d4af37' },
      { name: 'منتهي', value: expired, color: '#ef4444' },
    ]

    return (
      <AdminShell fullName={profile.fullName}>
        <div style={s.page}>
          <div style={s.headerBar}>
            <div>
              <h1 style={s.title}>لوحة التحكم</h1>
              <p style={{ color: '#94a3b8', margin: 0 }}>مرحبًا بك، {profile.fullName} 👑</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={s.statCard}>
              <p style={s.statLabel}>👥 اللاعبون</p>
              <p style={s.statValue}>{totalPlayers}</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statLabel}>🏃 المدربون</p>
              <p style={s.statValue}>{totalCoaches}</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statLabel}>💰 الإيرادات الكلية</p>
              <p style={s.statValue}>{totalRevenue._sum.amount || 0} جنيه</p>
            </div>
          </div>

          <DashboardCharts revenueData={revenueChartData} statusData={statusChartData} />

          <div style={{ marginTop: 28, background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: '#d4af37', margin: '0 0 12px' }}>⚠️ اشتراكات على وشك الانتهاء ({expiringSubs.length})</h3>
            {expiringSubs.length > 0 ? (
              <ul style={{ margin: 0, paddingRight: 20, color: '#e2e8f0' }}>
                {expiringSubs.map((sub) => (
                  <li key={sub.id} style={{ marginBottom: 6 }}>
                    {sub.player.fullName} — ينتهي في {new Date(sub.endDate).toLocaleDateString('ar-EG')}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#e2e8f0', margin: 0 }}>لا توجد اشتراكات على وشك الانتهاء</p>
            )}
          </div>

          <h3 style={{ marginTop: 36, marginBottom: 4, color: '#f8fafc', fontSize: 20 }}>الإجراءات السريعة</h3>
          <div style={s.actionGrid}>
            <a href="/admin/add-payment" className="action-card" style={s.actionCard}>
              <span style={{ fontSize: 24 }}>💵</span>
              تسجيل دخل
            </a>
            <a href="/admin/add-player" className="action-card" style={s.actionCard}>
              <span style={{ fontSize: 24 }}>➕</span>
              إضافة لاعب
            </a>
            <a href="/admin/add-coach" className="action-card" style={s.actionCard}>
              <span style={{ fontSize: 24 }}>🏋️</span>
              إضافة مدرب
            </a>
            <a href="/admin/sports" className="action-card" style={s.actionCard}>
              <span style={{ fontSize: 24 }}>🏅</span>
              الرياضات
            </a>
          </div>
        </div>
      </AdminShell>
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
      <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: "'Tajawal', sans-serif", padding: 20, background: '#fff', color: '#000', borderRadius: 16 }}>
        <h1>مرحبًا أيها المدرب {profile.fullName} 🏃</h1>
        <p style={{ color: '#666' }}>فريقك ({myPlayers.length} لاعبًا)</p>

        <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <a href="/coach/add-player" className="btn-primary" style={{ padding: '12px 22px', background: '#0f172a', color: '#d4af37', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
            + إضافة لاعب
          </a>
          <a href="/coach/search" className="btn-primary" style={{ padding: '12px 22px', background: '#0f172a', color: '#d4af37', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
            🔍 البحث عن لاعب
          </a>
          <a href="/coach/subscriptions" className="btn-primary" style={{ padding: '12px 22px', background: '#0f172a', color: '#d4af37', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
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
                  style={{ display: 'block', background: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 10, color: '#000', textDecoration: 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{p.fullName}</span>
                    <span>←</span>
                  </div>

                  {subWarning && <p style={{ color: 'red', margin: '4px 0 0', fontSize: 14 }}>🔴 الاشتراك على وشك الانتهاء</p>}
                  {medicalWarning && <p style={{ color: 'orange', margin: '4px 0 0', fontSize: 14 }}>🟠 الكشف الطبي على وشك الانتهاء</p>}
                  {last3Absent && <p style={{ color: 'red', margin: '4px 0 0', fontSize: 14 }}>🔴 تغيّب عن آخر ثلاث حصص متتالية</p>}
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