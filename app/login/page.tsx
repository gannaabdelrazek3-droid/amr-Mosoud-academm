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

const buttonStyle = {
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
}

export default function LoginPage() {
  const [mode, setMode] = useState<'staff' | 'player'>('staff')
  const [playerSubMode, setPlayerSubMode] = useState<'login' | 'signup'>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      return
    }
    router.push('/dashboard')
  }

  async function handlePlayerLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      return
    }
    router.push('/player')
  }

  async function handlePlayerSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/player-signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'حدثت مشكلة، حاول مرة أخرى')
      return
    }

    router.push('/player')
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
          background: 'rgba(30, 41, 59, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: 20,
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👑</div>
          <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 900, margin: 0 }}>تسجيل الدخول</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>أدخل بياناتك للوصول إلى النظام</p>
        </div>

        <div style={{ display: 'flex', marginBottom: 24, background: 'rgba(15, 23, 42, 0.5)', borderRadius: 10, padding: 4 }}>
          <button
            onClick={() => { setMode('staff'); setError('') }}
            className="btn-primary"
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: 'none',
              fontFamily: "'Tajawal', sans-serif",
              fontWeight: 700,
              background: mode === 'staff' ? '#d4af37' : 'transparent',
              color: mode === 'staff' ? '#0f172a' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            إدارة / مدرب
          </button>
          <button
            onClick={() => { setMode('player'); setError('') }}
            className="btn-primary"
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: 'none',
              fontFamily: "'Tajawal', sans-serif",
              fontWeight: 700,
              background: mode === 'player' ? '#d4af37' : 'transparent',
              color: mode === 'player' ? '#0f172a' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            لاعب
          </button>
        </div>

        {mode === 'staff' && (
          <form onSubmit={handleStaffLogin}>
            <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            <button type="submit" disabled={loading} className="btn-primary" style={buttonStyle}>
              {loading ? 'جارٍ الدخول...' : 'دخول'}
            </button>
          </form>
        )}

        {mode === 'player' && (
          <>
            <div style={{ display: 'flex', marginBottom: 16, gap: 8 }}>
              <button
                onClick={() => { setPlayerSubMode('login'); setError('') }}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  fontFamily: "'Tajawal', sans-serif",
                  background: playerSubMode === 'login' ? '#d4af37' : 'transparent',
                  color: playerSubMode === 'login' ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                عندي حساب
              </button>
              <button
                onClick={() => { setPlayerSubMode('signup'); setError('') }}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  fontFamily: "'Tajawal', sans-serif",
                  background: playerSubMode === 'signup' ? '#d4af37' : 'transparent',
                  color: playerSubMode === 'signup' ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                حساب جديد
              </button>
            </div>

            {playerSubMode === 'login' ? (
              <form onSubmit={handlePlayerLogin}>
                <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
                <button type="submit" disabled={loading} className="btn-primary" style={buttonStyle}>
                  {loading ? 'جارٍ الدخول...' : 'دخول'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePlayerSignup}>
                <input type="text" placeholder="الاسم بالكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />
                <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                <input type="tel" placeholder="رقم الهاتف (اختياري)" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength={6} />
                <button type="submit" disabled={loading} className="btn-primary" style={buttonStyle}>
                  {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
                </button>
              </form>
            )}
          </>
        )}

        {error && <p style={{ color: '#fca5a5', textAlign: 'center', marginTop: 14, fontSize: 14 }}>{error}</p>}
      </div>
    </div>
  )
}