'use client'

import { useState, useEffect, useCallback } from 'react'

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

const cardStyle = {
  background: 'rgba(30,41,59,0.6)',
  borderRadius: 14,
  padding: '16px 18px',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginTop: 6,
  marginBottom: 12,
  fontSize: 14,
  fontFamily: "'Tajawal', sans-serif",
  border: '1px solid rgba(148,163,184,0.3)',
  borderRadius: 8,
  background: 'rgba(15,23,42,0.5)',
  color: '#f1f5f9',
  boxSizing: 'border-box' as const,
}

const labelStyle = { display: 'block', color: '#cbd5e1', fontWeight: 700, fontSize: 13 }

const buttonStyle = {
  padding: '10px 20px',
  background: '#d4af37',
  color: '#0f172a',
  border: 'none',
  borderRadius: 8,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'Tajawal', sans-serif",
}

export default function SecretarySubscriptionsPage() {
  const [subs, setSubs] = useState<SubItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState('')

  const [amount, setAmount] = useState('')
  const [sessions, setSessions] = useState('')
  const [duration, setDuration] = useState('30')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadSubs = useCallback(() => {
    setLoading(true)
    fetch('/api/secretary/subscriptions')
      .then((res) => res.json())
      .then((data) => setSubs(data.subscriptions || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadSubs()
  }, [loadSubs])

  function openRenew(playerId: string) {
    setOpenId(playerId)
    setAmount('')
    setSessions('')
    setDuration('30')
    setMessage('')
  }

  async function handleRenew(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/secretary/renew-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: openId, amount, totalSessions: sessions, durationDays: duration }),
    })

    setSaving(false)

    if (!res.ok) {
      setMessage('حدثت مشكلة، حاول مرة أخرى')
      return
    }

    setOpenId('')
    loadSubs()
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>متابعة الاشتراكات</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>حالة اشتراكات كل اللاعبين، مع إمكانية التجديد المباشر</p>

        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : subs.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا توجد اشتراكات مسجّلة</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subs.map((s) => (
              <div key={s.playerId} style={{ ...cardStyle, border: `1px solid ${statusInfo[s.status].color}40` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: 16 }}>{s.fullName}</p>
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>
                      {s.remaining} من {s.totalSessions} حصة — ينتهي {new Date(s.endDate).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: statusInfo[s.status].color, fontWeight: 800, fontSize: 14 }}>
                      {statusInfo[s.status].label}
                    </span>
                    <button type="button" onClick={() => openRenew(s.playerId)} style={buttonStyle}>
                      تجديد
                    </button>
                  </div>
                </div>

                {openId === s.playerId && (
                  <form onSubmit={handleRenew} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                    <label style={labelStyle}>المبلغ (جنيه)</label>
                    <input type="number" step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} required />

                    <label style={labelStyle}>عدد الحصص</label>
                    <input type="number" min="1" value={sessions} onChange={(e) => setSessions(e.target.value)} style={inputStyle} required />

                    <label style={labelStyle}>مدة الاشتراك (أيام)</label>
                    <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} required />

                    <button type="submit" disabled={saving} style={{ ...buttonStyle, width: '100%' }}>
                      {saving ? 'جارٍ الحفظ...' : 'تأكيد التجديد'}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}

        {message && <p style={{ color: '#fca5a5', marginTop: 14 }}>{message}</p>}
      </div>
    </div>
  )
}