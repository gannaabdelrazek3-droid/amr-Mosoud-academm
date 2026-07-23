'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { adminStyles as s } from '../../adminStyles'
import AdminShell from '../../AdminShell'

interface CoachDetails { id: string; fullName: string; phone: string }

export default function EditCoachPage() {
  const params = useParams()
  const coachId = params.coachId as string

  const [coach, setCoach] = useState<CoachDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!coachId) return
    fetch(`/api/admin/coach-details?coachId=${coachId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.coach) {
          setCoach(data.coach)
          setFullName(data.coach.fullName)
          setPhone(data.coach.phone)
        }
      })
      .finally(() => setLoading(false))
  }, [coachId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/edit-coach', {
      method: 'POST',
      body: JSON.stringify({ coachId, fullName, phone, newPassword }),
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
  if (!coach) {
    return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>المدرب غير موجود</p></div></AdminShell>
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>{coach.fullName}</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>تعديل بيانات المدرب</p>
          </div>
        </div>

        <div style={s.formCard}>
          <form onSubmit={handleSave}>
            <label style={s.label}>
              الاسم الكامل
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              رقم الهاتف
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              كلمة مرور جديدة (اتركها فارغة إذا لا ترغب بالتغيير)
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={s.input} minLength={6} />
            </label>
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