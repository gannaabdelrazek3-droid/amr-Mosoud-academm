'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const cardStyle = { maxWidth: 640, margin: '40px auto', fontFamily: "'Tajawal', sans-serif", padding: 32, background: 'rgba(30,41,59,0.7)', color: '#e2e8f0', borderRadius: 16, border: '1px solid rgba(212,175,55,0.25)' }
const labelStyle = { display: 'block', marginTop: 20, fontSize: 16, fontWeight: 700, color: '#cbd5e1' }
const inputStyle = { width: '100%', padding: '14px 16px', marginTop: 8, fontSize: 16, border: '1px solid rgba(148,163,184,0.3)', borderRadius: 10, background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', boxSizing: 'border-box' as const }
const buttonStyle = { width: '100%', padding: 16, marginTop: 20, fontSize: 17, fontWeight: 700, background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 10, cursor: 'pointer' }

interface PlayerDetails {
  id: string
  fullName: string
  phone: string | null
  birthDate: string | null
  sportsBackground: string | null
  subscriptions: { remaining: number; totalSessions: number; endDate: string }[]
}

export default function CoachPlayerPage() {
  const params = useParams()
  const playerId = params.playerId as string

  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [amount, setAmount] = useState('')
  const [sessions, setSessions] = useState('')
  const [duration, setDuration] = useState('30')
  const [renewing, setRenewing] = useState(false)
  const [renewMessage, setRenewMessage] = useState('')

  function loadPlayer() {
    setLoading(true)
    fetch(`/api/coach/player-details?playerId=${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.player) {
          setPlayer(data.player)
          setFullName(data.player.fullName)
          setPhone(data.player.phone || '')
          setBirthDate(data.player.birthDate ? data.player.birthDate.split('T')[0] : '')
          setSportsBackground(data.player.sportsBackground || '')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (playerId) loadPlayer() }, [playerId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/coach/edit-player', {
      method: 'POST',
      body: JSON.stringify({ playerId, fullName, phone, birthDate, sportsBackground }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMessage(data.error || 'حدثت مشكلة'); return }
    setMessage('تم الحفظ بنجاح')
  }

  async function handleRenew(e: React.FormEvent) {
    e.preventDefault()
    setRenewing(true)
    setRenewMessage('')
    const res = await fetch('/api/coach/renew-subscription', {
      method: 'POST',
      body: JSON.stringify({ playerId, amount, totalSessions: sessions, durationDays: duration }),
    })
    setRenewing(false)
    if (!res.ok) { setRenewMessage('حدثت مشكلة في التجديد'); return }
    setRenewMessage('تم التجديد بنجاح')
    setAmount(''); setSessions('')
    loadPlayer()
  }

  if (loading) return <div style={cardStyle}><p>جارٍ التحميل...</p></div>
  if (!player) return <div style={cardStyle}><p>اللاعب غير موجود أو ليس ضمن فريقك</p></div>

  const activeSub = player.subscriptions[0]

  return (
    <div style={cardStyle}>
      <h1 style={{ color: '#f8fafc' }}>{player.fullName}</h1>

      <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <p style={{ margin: '4px 0', color: '#e2e8f0' }}>
          📅 الاشتراك: {activeSub ? `${activeSub.remaining} من ${activeSub.totalSessions} حصة، ينتهي ${new Date(activeSub.endDate).toLocaleDateString('ar-EG')}` : 'لا يوجد اشتراك نشط'}
        </p>
      </div>

      <h3 style={{ color: '#f8fafc', fontSize: 17 }}>✏️ تعديل بيانات اللاعب</h3>
      <form onSubmit={handleSave}>
        <label style={labelStyle}>
          الاسم الكامل
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />
        </label>
        <label style={labelStyle}>
          رقم الهاتف
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          تاريخ الميلاد
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          الخلفية الرياضية
          <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={inputStyle} />
        </label>
        <button type="submit" disabled={saving} className="btn-primary" style={buttonStyle}>
          {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
        </button>
        {message && <p style={{ color: '#fca5a5', marginTop: 14 }}>{message}</p>}
      </form>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
        <h3 style={{ color: '#f8fafc', fontSize: 17 }}>💰 تجديد الاشتراك</h3>
        <form onSubmit={handleRenew}>
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
          <button type="submit" disabled={renewing} className="btn-primary" style={buttonStyle}>
            {renewing ? 'جارٍ التجديد...' : 'تجديد الاشتراك'}
          </button>
          {renewMessage && <p style={{ color: '#fca5a5', marginTop: 14 }}>{renewMessage}</p>}
        </form>
      </div>
    </div>
  )
}