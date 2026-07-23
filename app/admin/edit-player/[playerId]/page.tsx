'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { adminStyles as s } from '../../adminStyles'
import AdminShell from '../../AdminShell'

interface PlayerDetails {
  id: string
  fullName: string
  phone: string | null
  birthDate: string | null
  sportsBackground: string | null
  email: string | null
  subscriptions: { remaining: number; endDate: string }[]
  sports: { sport: { name: string } }[]
}

export default function EditPlayerPage() {
  const params = useParams()
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
    if (!res.ok) { setMessage(data.error || 'حدثت مشكلة'); return }
    setMessage('تم الحفظ بنجاح')
    setNewPassword('')
  }

  if (loading) {
    return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>
  }
  if (!player) {
    return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>اللاعب غير موجود</p></div></AdminShell>
  }

  const activeSub = player.subscriptions[0]

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>{player.fullName}</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>تعديل بيانات اللاعب</p>
          </div>
        </div>

        <div style={{ ...s.statCard, marginBottom: 24, maxWidth: 640 }}>
          <p style={{ margin: '4px 0', color: '#e2e8f0' }}>📧 {player.email || 'لا يوجد حساب دخول'}</p>
          <p style={{ margin: '4px 0', color: '#e2e8f0' }}>🏅 الرياضات: {player.sports.map((s) => s.sport.name).join('، ') || 'لا توجد'}</p>
          <p style={{ margin: '4px 0', color: '#e2e8f0' }}>
            📅 الاشتراك: {activeSub ? `${activeSub.remaining} حصة متبقية، ينتهي ${new Date(activeSub.endDate).toLocaleDateString('ar-EG')}` : 'لا يوجد اشتراك نشط'}
          </p>
        </div>

        <div style={s.formCard}>
          <form onSubmit={handleSave}>
            <label style={s.label}>
              الاسم الكامل
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              رقم الهاتف
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              تاريخ الميلاد
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              الخلفية الرياضية
              <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={s.input} />
            </label>

            {player.email && (
              <label style={s.label}>
                كلمة مرور جديدة (اتركها فارغة إذا لا ترغب بالتغيير)
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={s.input} minLength={6} />
              </label>
            )}

            <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
              {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>

            {message && <p style={s.error}>{message}</p>}
          </form>
        </div>
      </div>
    </AdminShell>
  )
}