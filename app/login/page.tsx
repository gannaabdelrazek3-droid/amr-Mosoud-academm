'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
      setError('الإيميل أو الباسورد غلط')
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
      setError('الإيميل أو الباسورد غلط')
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
      setError(data.error || 'حصلت مشكلة، حاول تاني')
      return
    }

    router.push('/player')
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif', background: '#fff', color: '#000', padding: 20, borderRadius: 12 }}>
      <h1 style={{ textAlign: 'center' }}>تسجيل الدخول</h1>

      <div style={{ display: 'flex', marginBottom: 20 }}>
        <button
          onClick={() => { setMode('staff'); setError('') }}
          style={{ flex: 1, padding: 10, background: mode === 'staff' ? '#333' : '#eee', color: mode === 'staff' ? '#fff' : '#000' }}
        >
          إدارة / مدرب
        </button>
        <button
          onClick={() => { setMode('player'); setError('') }}
          style={{ flex: 1, padding: 10, background: mode === 'player' ? '#333' : '#eee', color: mode === 'player' ? '#fff' : '#000' }}
        >
          لاعب
        </button>
      </div>

      {mode === 'staff' && (
        <form onSubmit={handleStaffLogin}>
          <input type="email" placeholder="الإيميل" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
          <input type="password" placeholder="الباسورد" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#111', color: '#fff' }}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      )}

      {mode === 'player' && (
        <>
          <div style={{ display: 'flex', marginBottom: 16, gap: 8 }}>
            <button
              onClick={() => { setPlayerSubMode('login'); setError('') }}
              style={{ flex: 1, padding: 8, background: playerSubMode === 'login' ? '#111' : '#eee', color: playerSubMode === 'login' ? '#fff' : '#000', borderRadius: 6 }}
            >
              عندي حساب
            </button>
            <button
              onClick={() => { setPlayerSubMode('signup'); setError('') }}
              style={{ flex: 1, padding: 8, background: playerSubMode === 'signup' ? '#111' : '#eee', color: playerSubMode === 'signup' ? '#fff' : '#000', borderRadius: 6 }}
            >
              حساب جديد
            </button>
          </div>

          {playerSubMode === 'login' ? (
            <form onSubmit={handlePlayerLogin}>
              <input type="email" placeholder="الإيميل" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
              <input type="password" placeholder="الباسورد" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#111', color: '#fff' }}>
                {loading ? 'جاري الدخول...' : 'دخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePlayerSignup}>
              <input type="text" placeholder="الاسم بالكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
              <input type="email" placeholder="الإيميل" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
              <input type="tel" placeholder="رقم التليفون (اختياري)" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
              <input type="password" placeholder="الباسورد" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required minLength={6} />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#111', color: '#fff' }}>
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </form>
          )}
        </>
      )}

      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</p>}
    </div>
  )
}