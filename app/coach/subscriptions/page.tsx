'use client'

import { useState, useEffect } from 'react'

const cardStyle = { maxWidth: 640, margin: '40px auto', fontFamily: "'Tajawal', sans-serif", padding: 32, background: 'rgba(30,41,59,0.7)', color: '#e2e8f0', borderRadius: 16, border: '1px solid rgba(212,175,55,0.25)' }
const labelStyle = { display: 'block', marginTop: 20, fontSize: 16, fontWeight: 700, color: '#cbd5e1' }
const inputStyle = { width: '100%', padding: '14px 16px', marginTop: 8, fontSize: 16, border: '1px solid rgba(148,163,184,0.3)', borderRadius: 10, background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', boxSizing: 'border-box' as const }
const buttonStyle = { width: '100%', padding: 16, marginTop: 20, fontSize: 17, fontWeight: 700, background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 10, cursor: 'pointer' }

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
    fetch('/api/coach/subscriptions').then((res) => res.json()).then((data) => setPlayers(data.players || [])).finally(() => setLoading(false))
  }

  useEffect(() => { loadPlayers() }, [])

  function openRenew(id: string) {
    setOpenId(id); setAmount(''); setSessions(''); setDuration('30'); setMessage('')
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
    if (!res.ok) { setMessage('حدثت مشكلة، حاول مرة أخرى'); return }
    setOpenId('')
    loadPlayers()
  }

  function statusInfo(p: PlayerSub) {
    if (!p.endDate) return { text: 'لا يوجد اشتراك', color: '#94a3b8' }
    if (p.daysLeft !== null && p.daysLeft < 0) return { text: 'انتهى الاشتراك', color: '#fca5a5' }
    if (p.daysLeft !== null && p.daysLeft <= 7) return { text: `متبقٍ ${p.daysLeft} يوم فقط`, color: '#d4af37' }
    return { text: `نشط، متبقٍ ${p.daysLeft} يوم`, color: '#4ade80' }
  }

  if (loading) return <div style={cardStyle}><p>جارٍ التحميل...</p></div>

  return (
    <div style={cardStyle}>
      <h1 style={{ color: '#f8fafc' }}>متابعة اشتراكات لاعبيّ</h1>
      <p style={{ color: '#94a3b8' }}>عدد اللاعبين: {players.length}</p>

      {players.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>لا يوجد لاعبون مسجّلون معك حتى الآن</p>
      ) : (
        players.map((p) => {
          const status = statusInfo(p)
          return (
            <div key={p.id} style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#f8fafc' }}>{p.fullName}</strong>
                  <p style={{ fontSize: 14, color: status.color, margin: '4px 0 0', fontWeight: 700 }}>{status.text}</p>
                  {p.remaining !== null && (
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: '2px 0 0' }}>الحصص المتبقية: {p.remaining} من {p.totalSessions}</p>
                  )}
                </div>
                <button onClick={() => openRenew(p.id)} className="btn-primary" style={{ padding: '8px 16px', background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 700 }}>
                  تجديد
                </button>
              </div>

              {openId === p.id && (
                <form onSubmit={handleRenew} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                  <label style={labelStyle}>
                    المبلغ (جنيه)
                    <input type="number" step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} required />
                  </label>
                  <label style={labelStyle}>
                    عدد الحصص
                    <input type="number" min="1" value={sessions} onChange={(e) => setSessions(e.target.value)} style={inputStyle} required />
                  </label>
                  <label style={labelStyle}>
                    مدة الاشتراك (أيام)
                    <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} required />
                  </label>
                  <button type="submit" disabled={saving} className="btn-primary" style={buttonStyle}>
                    {saving ? 'جارٍ الحفظ...' : 'تأكيد التجديد'}
                  </button>
                </form>
              )}
            </div>
          )
        })
      )}

      {message && <p style={{ color: '#fca5a5', marginTop: 14 }}>{message}</p>}
    </div>
  )
}