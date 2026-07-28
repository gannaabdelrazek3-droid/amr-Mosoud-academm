'use client'

import { useState } from 'react'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError('حدثت مشكلة، تأكد من صحة البريد الإلكتروني')
      return
    }

    setSent(true)
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
          <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 900, margin: 0 }}>نسيت كلمة المرور؟</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 15 }}>✓ تم إرسال رابط إعادة التعيين</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 10 }}>تحقق من بريدك الإلكتروني واتبع الرابط لتعيين كلمة مرور جديدة</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
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
              {loading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>
            {error && <p style={{ color: '#fca5a5', textAlign: 'center', marginTop: 14, fontSize: 14 }}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}