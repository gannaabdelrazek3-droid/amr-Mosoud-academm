import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function PlayerDashboard() {
  const cookieStore = await cookies()
  const playerId = cookieStore.get('player_id')?.value

  if (!playerId) {
    redirect('/login')
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      subscriptions: {
        orderBy: { endDate: 'desc' },
        take: 1,
      },
      tournaments: {
        orderBy: { year: 'desc' },
      },
      attendances: true,
    },
  })

  if (!player) {
    redirect('/login')
  }

  const activeSubscription = player.subscriptions[0]
  const daysLeft = activeSubscription
    ? Math.ceil((new Date(activeSubscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const attendedCount = player.attendances.filter((a) => a.present).length

  const trainingSince = player.joinDate
    ? Math.floor((Date.now() - new Date(player.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif', padding: 20, background: '#ffffff', color: '#000000' }}>
      <h1>أهلاً، {player.fullName} 👋</h1>

      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h3>📊 الاشتراك</h3>
        {activeSubscription ? (
          <>
            <p>الحصص المتبقية: <strong>{activeSubscription.remaining}</strong> من {activeSubscription.totalSessions}</p>
            <p style={{ color: daysLeft !== null && daysLeft <= 7 ? 'red' : 'inherit' }}>
              باقي على الانتهاء: <strong>{daysLeft} يوم</strong>
            </p>
          </>
        ) : (
          <p>مفيش اشتراك نشط حالياً</p>
        )}
      </div>

      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h3>🏋️ التمرين</h3>
        <p>عدد التمارين اللي حضرتها: <strong>{attendedCount}</strong></p>
        {trainingSince !== null && (
          <p>بتتمرن معانا من: <strong>{trainingSince} شهر</strong></p>
        )}
      </div>

      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h3>🏥 الكشف الطبي</h3>
        {player.medicalCheckExpiry ? (
          <p>ساري لغاية: {new Date(player.medicalCheckExpiry).toLocaleDateString('ar-EG')}</p>
        ) : (
          <p style={{ color: 'orange' }}>لسه معملتش كشف طبي</p>
        )}
      </div>

      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h3>🏆 البطولات</h3>
        {player.tournaments.length > 0 ? (
          <ul>
            {player.tournaments.map((t) => (
              <li key={t.id}>
                {t.name} ({t.year}) {t.result && `- ${t.result}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>لسه مفيش بطولات مسجلة</p>
        )}
      </div>
    </div>
  )
}
