'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mode, setMode] = useState<'staff' | 'player'>('staff')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setError('الإيميل أو الباسورد غلط')
      return
    }
    router.push('/dashboard')
  }

  async function handlePlayerLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/player-login', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    })
    if (!res.ok) {
      setError('رقم التليفون أو الكود غلط')
      return
    }
    router.push('/player')
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif', background: '#ffffff', color: '#000000', padding: 20, borderRadius: 12 }}>
      <h1 style={{ textAlign: 'center' }}>تسجيل الدخول</h1>

      <div style={{ display: 'flex', marginBottom: 20 }}>
        <button onClick={() => setMode('staff')} style={{ flex: 1, padding: 10, background: mode === 'staff' ? '#333' : '#eee', color: mode === 'staff' ? '#fff' : '#000' }}>
          إدارة / مدرب
        </button>
        <button onClick={() => setMode('player')} style={{ flex: 1, padding: 10, background: mode === 'player' ? '#333' : '#eee', color: mode === 'player' ? '#fff' : '#000' }}>
          لاعب
        </button>
      </div>

      {mode === 'staff' ? (
        <form onSubmit={handleStaffLogin}>
          <input type="email" placeholder="الإيميل" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
          <input type="password" placeholder="الباسورد" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
          <button type="submit" style={{ width: '100%', padding: 10, background: '#111', color: '#fff' }}>دخول</button>
        </form>
      ) : (
        <form onSubmit={handlePlayerLogin}>
          <input type="tel" placeholder="رقم التليفون" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
          <input type="text" placeholder="الكود" value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} required />
          <button type="submit" style={{ width: '100%', padding: 10, background: '#111', color: '#fff' }}>دخول</button>
        </form>
      )}

      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</p>}
    </div>
  )
}