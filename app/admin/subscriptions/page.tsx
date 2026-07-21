'use client'

import { useState, useEffect } from 'react'
import { adminStyles as s } from '../adminStyles'

interface DuePlayer {
  id: string
  fullName: string
  lastEndDate: string | null
  lastRemaining: number | null
}

export default function SubscriptionsPage() {
  const [players, setPlayers] = useState<DuePlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState('')

  const [amount, setAmount] = useState('')
  const [sessions, setSessions] = useState('')
  const [duration, setDuration] = useState('30')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function loadPlayers() {
    setLoading(true)
    fetch('/api/admin/subscriptions/due')
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

    const res = await fetch('/api/admin/subscriptions/renew', {
      method: 'POST',
      body: JSON.stringify({
        playerId: openId,
        amount,
        totalSessions: sessions,
        durationDays: duration,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      setMessage('حصلت مشكلة، حاول تاني')
      return
    }

    setOpenId('')
    loadPlayers()
  }

  if (loading) {
    return <div style={s.page}><p>جاري التحميل...</p></div>
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>تجميع الاشتراكات الشهرية</h1>
      <p style={s.subtitle}>اللاعبين اللي محتاجين تجديد ({players.length})</p>

      {players.length === 0 ? (
        <p style={{ color: '#999' }}>كل الاشتراكات سارية، مفيش حد محتاج تجديد دلوقتي 🎉</p>
      ) : (
        players.map((p) => (
          <div key={p.id} style={{ background: '#f8f8f8', borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 17 }}>{p.fullName}</strong>
                <p style={{ fontSize: 14, color: '#555', margin: '4px 0 0' }}>
                  {p.lastEndDate
                    ? `آخر اشتراك انتهى في ${new Date(p.lastEndDate).toLocaleDateString('ar-EG')}`
                    : 'لسه معملش أي اشتراك'}
                </p>
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
        ))
      )}

      {message && <p style={s.error}>{message}</p>}
    </div>
  )
}