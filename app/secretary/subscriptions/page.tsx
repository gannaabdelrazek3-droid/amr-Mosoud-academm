'use client'

import { useState, useEffect } from 'react'

interface SubItem {
  playerId: string
  fullName: string
  remaining: number
  totalSessions: number
  endDate: string
  status: 'active' | 'expiring' | 'expired'
}

const statusInfo = {
  active: { label: 'نشط', color: '#22c55e' },
  expiring: { label: 'قرب الانتهاء', color: '#d4af37' },
  expired: { label: 'منتهي', color: '#ef4444' },
}

export default function SecretarySubscriptionsPage() {
  const [subs, setSubs] = useState<SubItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/secretary/subscriptions')
      .then((res) => res.json())
      .then((data) => setSubs(data.subscriptions || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>متابعة الاشتراكات</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>حالة اشتراكات كل اللاعبين</p>

        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : subs.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا توجد اشتراكات مسجّلة</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subs.map((s) => (
              <div
                key={s.playerId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(30,41,59,0.6)',
                  border: `1px solid ${statusInfo[s.status].color}40`,
                  borderRadius: 14,
                  padding: '16px 18px',
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: 16 }}>{s.fullName}</p>
                  <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>
                    {s.remaining} من {s.totalSessions} حصة — ينتهي {new Date(s.endDate).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <span style={{ color: statusInfo[s.status].color, fontWeight: 800, fontSize: 14 }}>
                  {statusInfo[s.status].label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}