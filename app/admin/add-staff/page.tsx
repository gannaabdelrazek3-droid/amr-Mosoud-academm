'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

export default function AddStaffPage() {
  const router = useRouter()
  const [role, setRole] = useState<'COACH' | 'SECRETARY'>('COACH')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setSaving(true)
    const res = await fetch('/api/admin/add-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone, email, password, role }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error || 'حدثت مشكلة، حاول مرة أخرى')
      return
    }

    router.push('/dashboard')
  }

  const toggleWrapStyle = {
    display: 'flex',
    marginBottom: 28,
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 10,
    padding: 4,
    maxWidth: 400,
  }

  function toggleBtnStyle(active: boolean) {
    return {
      flex: 1,
      padding: '12px 16px',
      borderRadius: 8,
      border: 'none',
      fontFamily: "'Tajawal', sans-serif",
      fontWeight: 700,
      fontSize: 14,
      background: active ? '#d4af37' : 'transparent',
      color: active ? '#0f172a' : '#94a3b8',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>{role === 'COACH' ? 'إضافة مدرب جديد' : 'إضافة سكرتيرة جديدة'}</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              {role === 'COACH' ? 'المدرب يقدر يدير لاعبيه ورياضاته' : 'السكرتيرة تقدر تسجّل الحضور وتتابع الاشتراكات والمخزون'}
            </p>
          </div>
        </div>

        <div style={toggleWrapStyle}>
          <button type="button" onClick={() => setRole('COACH')} style={toggleBtnStyle(role === 'COACH')}>
            🏋️ مدرب
          </button>
          <button type="button" onClick={() => setRole('SECRETARY')} style={toggleBtnStyle(role === 'SECRETARY')}>
            📋 سكرتيرة
          </button>
        </div>

        <div style={s.formCard}>
          <form onSubmit={handleSubmit}>
            <label style={s.label}>
              الاسم الكامل
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              رقم الهاتف
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              البريد الإلكتروني
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              كلمة المرور
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} required minLength={6} />
            </label>

            <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
              {saving ? 'جارٍ الإضافة...' : role === 'COACH' ? 'إضافة المدرب' : 'إضافة السكرتيرة'}
            </button>

            {error && <p style={s.error}>{error}</p>}
          </form>
        </div>
      </div>
    </AdminShell>
  )
}