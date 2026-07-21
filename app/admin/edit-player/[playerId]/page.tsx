'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminStyles as s } from '../../adminStyles'

interface PlayerDetails {
  id: string
  fullName: string
  phone: string | null
  birthDate: string | null
  sportsBackground: string | null
  email: string | null
  subscriptions: { remaining: number; endDate: string }[]
  sports: { sport: { name: string } }[]
  payments: { amount: number; date: string; description: string | null }[]
}

export default function EditPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.playerId as string

  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!playerId) return
    fetch(`/api/admin/player-details?playerId=${playerId}`)
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
  }, [playerId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/edit-player', {
      method: 'POST',
      body: JSON.stringify({ playerId, fullName, phone, birthDate, sportsBackground, newPassword }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حصلت مشكلة')
      return
    }

    setMessage('تم الحفظ بنجاح')
    setNewPassword('')
  }

  if (loading) {
    return <div style={s.page}><p>جاري التحميل...</p></div>
  }

  if (!player) {
    return <div style={s.page}><p>اللاعب غير موجود</p></div>
  }

  const activeSub = player.subscriptions[0]

  return (
    <div style={s.page}>
      <h1 style={s.title}>{player.fullName}</h1>
      <p style={s.subtitle}>تعديل بيانات اللاعب</p>

      <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <p style={{ margin: '4px 0' }}>📧 {player.email || 'مفيش حساب دخول'}</p>
        <p style={{ margin: '4px 0' }}>
          🏅 الرياضات: {player.sports.map((s) => s.sport.name).join('، ') || 'مفيش'}
        </p>
        <p style={{ margin: '4px 0' }}>
          📅 الاشتراك: {activeSub ? `${activeSub.remaining} حصة متبقية، بينتهي ${new Date(activeSub.endDate).toLocaleDateString('ar-EG')}` : 'مفيش اشتراك نشط'}
        </p>
      </div>

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

        {player.email && (
          <label style={s.label}>
            باسورد جديد (سيبيها فاضية لو مش عايزة تغيّري)
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={s.input} minLength={6} />
          </label>
        )}

        <button type="submit" disabled={saving} style={s.button}>
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>

        {message && <p style={s.error}>{message}</p>}
      </form>
    </div>
  )
}