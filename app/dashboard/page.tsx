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

    return (
      <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif', padding: 20, background: '#fff', color: '#000' }}>
        <h1>أهلاً، {profile.fullName} 👑</h1>
        <p style={{ color: '#666' }}>لوحة تحكم الأدمن</p>

        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 12, padding: 20 }}>
            <h3>👥 اللاعبين</h3>
            <p style={{ fontSize: 28, fontWeight: 'bold' }}>{totalPlayers}</p>
          </div>
          <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 12, padding: 20 }}>
            <h3>🏃 المدربين</h3>
            <p style={{ fontSize: 28, fontWeight: 'bold' }}>{totalCoaches}</p>
          </div>
          <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 12, padding: 20 }}>
            <h3>💰 الإيرادات</h3>
            <p style={{ fontSize: 28, fontWeight: 'bold' }}>{totalRevenue._sum.amount || 0} جنيه</p>
          </div>
        </div>

        <div style={{ marginTop: 24, background: '#fff5f5', border: '1px solid #ffcccc', borderRadius: 12, padding: 20 }}>
          <h3>⚠️ اشتراكات هتخلص قريب ({expiringSubs.length})</h3>
          {expiringSubs.length > 0 ? (
            <ul style={{ marginTop: 10 }}>
              {expiringSubs.map((s) => (
                <li key={s.id} style={{ marginBottom: 6 }}>
                  {s.player.fullName} — بينتهي في {new Date(s.endDate).toLocaleDateString('ar-EG')}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', marginTop: 10 }}>مفيش اشتراكات هتخلص قريب</p>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
          <a
            href="/admin/add-payment"
            style={{ padding: '10px 20px', background: '#111', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
          >
            + تسجيل دخل جديد
          </a>
          <a
            href="/admin/add-player"
            style={{ padding: '10px 20px', background: '#111', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
          >
            + إضافة لاعب
          </a>
          <a
            href="/admin/add-coach"
            style={{ padding: '10px 20px', background: '#111', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
          >
            + إضافة مدرب
          </a>
          <a
            href="/admin/sports"
            style={{ padding: '10px 20px', background: '#111', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
          >
            🏅 الرياضات
          </a>
          <a
  href="/admin/inventory"
  style={{ padding: '10px 20px', background: '#111', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
>
  📦 المخزون
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
      <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif', padding: 20, background: '#fff', color: '#000' }}>
        <h1>أهلاً كوتش {profile.fullName} 🏃</h1>
        <p style={{ color: '#666' }}>فريقك ({myPlayers.length} لاعب)</p>

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

                  {subWarning && (
                    <p style={{ color: 'red', margin: '4px 0 0', fontSize: 14 }}>
                      🔴 الاشتراك قرب يخلص
                    </p>
                  )}
                  {medicalWarning && (
                    <p style={{ color: 'orange', margin: '4px 0 0', fontSize: 14 }}>
                      🟠 الكشف الطبي قرب يخلص
                    </p>
                  )}
                  {last3Absent && (
                    <p style={{ color: 'red', margin: '4px 0 0', fontSize: 14 }}>
                      🔴 غاب آخر 3 حصص متتالية
                    </p>
                  )}
                </a>
              )
            })
          ) : (
            <p>لسه مفيش لاعبين متسجلين في فريقك</p>
          )}
        </div>
      </div>
    )
  }

  return <p>مفيش صلاحية لدخول الصفحة دي</p>
}