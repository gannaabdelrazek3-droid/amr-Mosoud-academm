'use client'

import { useState, useEffect } from 'react'
import { adminStyles as s } from '../../admin/adminStyles'

interface PlayerSub {
  id: string
  fullName: string
  remaining: number | null
  totalSessions: number | null
  endDate: string | null
  daysLeft: number | null
}

export default function CoachSubscriptionsPage() {
  const [players, setPlayers] = useState<PlayerSub[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState('')

  const [amount, setAmount] = useState('')
  const [sessions, setSessions] = useState('')
  const [duration, setDuration] = useState('30')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function loadPlayers() {
    setLoading(true)
    fetch('/api/coach/subscriptions')
      .then((res) => res.json())
      .then((data) => setPlayers(data.players || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPlayers()
  }, [])

  function openRenew(id: string) {
    setOpenId(id)
    setAmount('')
    setSessions('')
    setDuration('30')
    setMessage('')
  }

  async function handleRenew(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/coach/renew-subscription', {
      method: 'POST',
      body: JSON.stringify({ playerId: openId, amount, totalSessions: sessions, durationDays: duration }),
    })

    setSaving(false)

    if (!res.ok) {
      setMessage('حصلت مشكلة، حاول تاني')
      return
    }

    setOpenId('')
    loadPlayers()
  }

  function statusInfo(p: PlayerSub) {
    if (!p.endDate) return { text: 'مفيش اشتراك خالص', color: '#999' }
    if (p.daysLeft !== null && p.daysLeft < 0) return { text: 'الاشتراك خلص', color: '#d32f2f' }
    if (p.daysLeft !== null && p.daysLeft <= 7) return { text: `باقي ${p.daysLeft} يوم بس`, color: '#f57c00' }
    return { text: `نشط، باقي ${p.daysLeft} يوم`, color: '#2e7d32' }
  }

  if (loading) {
    return <div style={s.page}><p>جاري التحميل...</p></div>
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>متابعة اشتراكات لاعبيني</h1>
      <p style={s.subtitle}>عدد اللاعبين: {players.length}</p>

      {players.length === 0 ? (
        <p style={{ color: '#999' }}>لسه مفيش لاعبين متسجلين معاك</p>
      ) : (
        players.map((p) => {
          const status = statusInfo(p)
          return (
            <div key={p.id} style={{ background: '#f8f8f8', borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 17 }}>{p.fullName}</strong>
                  <p style={{ fontSize: 14, color: status.color, margin: '4px 0 0', fontWeight: 600 }}>
                    {status.text}
                  </p>
                  {p.remaining !== null && (
                    <p style={{ fontSize: 13, color: '#666', margin: '2px 0 0' }}>
                      الحصص المتبقية: {p.remaining} من {p.totalSessions}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => openRenew(p.id)}
                  style={{ padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 8 }}
                >
                  تجديد
                </button>
              </div>

              {openId === p.id && (
                <form onSubmit={handleRenew} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
                  <label style={s.label}>
                    المبلغ (جنيه)
                    <input type="number" step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} style={s.input} required />
                  </label>

                  <label style={s.label}>
                    عدد الحصص
                    <input type="number" min="1" value={sessions} onChange={(e) => setSessions(e.target.value)} style={s.input} required />
                  </label>

                  <label style={s.label}>
                    مدة الاشتراك (أيام)
                    <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} style={s.input} required />
                  </label>

                  <button type="submit" disabled={saving} style={s.button}>
                    {saving ? 'جاري الحفظ...' : 'تأكيد التجديد'}
                  </button>
                </form>
              )}
            </div>
          )
        })
      )}

      {message && <p style={s.error}>{message}</p>}
    </div>
  )
}