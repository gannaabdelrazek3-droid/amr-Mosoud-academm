'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  marginBottom: 14,
  fontSize: 16,
  fontFamily: "'Tajawal', sans-serif",
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: 10,
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f1f5f9',
  boxSizing: 'border-box' as const,
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (updateError) {
      setError('حدثت مشكلة، حاول مرة أخرى')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 30% 20%, #1e293b 0%, #0f172a 60%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: 20,
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔑</div>
          <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 900, margin: 0 }}>تعيين كلمة مرور جديدة</h1>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 16 }}>✓ تم تغيير كلمة المرور بنجاح</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>جارٍ تحويلك لتسجيل الدخول...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 14,
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'Tajawal', sans-serif",
                background: '#d4af37',
                color: '#0f172a',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              {loading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور'}
            </button>
            {error && <p style={{ color: '#fca5a5', textAlign: 'center', marginTop: 14, fontSize: 14 }}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}