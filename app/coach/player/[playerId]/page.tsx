'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { adminStyles as s } from '../../../admin/adminStyles'

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

  useEffect(() => {
    if (playerId) loadPlayer()
  }, [playerId])

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

    if (!res.ok) {
      setMessage(data.error || 'حصلت مشكلة')
      return
    }

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

    if (!res.ok) {
      setRenewMessage('حصلت مشكلة في التجديد')
      return
    }

    setRenewMessage('تم التجديد بنجاح')
    setAmount('')
    setSessions('')
    loadPlayer()
  }

  if (loading) {
    return <div style={s.page}><p>جاري التحميل...</p></div>
  }

  if (!player) {
    return <div style={s.page}><p>اللاعب غير موجود أو مش بتاعك</p></div>
  }

  const activeSub = player.subscriptions[0]

  return (
    <div style={s.page}>
      <h1 style={s.title}>{player.fullName}</h1>

      <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <p style={{ margin: '4px 0' }}>
          📅 الاشتراك: {activeSub
            ? `${activeSub.remaining} من ${activeSub.totalSessions} حصة، بينتهي ${new Date(activeSub.endDate).toLocaleDateString('ar-EG')}`
            : 'مفيش اشتراك نشط'}
        </p>
      </div>

      <h3 style={{ fontSize: 17, marginBottom: 10 }}>✏️ تعديل بيانات اللاعب</h3>
      <form onSubmit={handleSave}>
        <label style={s.label}>
          الاسم بالكامل
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={s.input} required />
        </label>

        <label style={s.label}>
          رقم التليفون
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} />
        </label>

        <label style={s.label}>
          تاريخ الميلاد
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={s.input} />
        </label>

        <label style={s.label}>
          خلفية رياضية
          <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={s.input} />
        </label>

        <button type="submit" disabled={saving} style={s.button}>
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>

        {message && <p style={s.error}>{message}</p>}
      </form>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #eee' }}>
        <h3 style={{ fontSize: 17, marginBottom: 10 }}>💰 تجديد الاشتراك</h3>
        <form onSubmit={handleRenew}>
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

          <button type="submit" disabled={renewing} style={s.button}>
            {renewing ? 'جاري التجديد...' : 'تجديد الاشتراك'}
          </button>

          {renewMessage && <p style={s.error}>{renewMessage}</p>}
        </form>
      </div>
    </div>
  )
}