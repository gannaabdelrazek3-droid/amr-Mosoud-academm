'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Sport {
  id: string
  name: string
}

export default function AddCoachPage() {
  const router = useRouter()
  const [sports, setSports] = useState<Sport[]>([])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/sports')
      .then((res) => res.json())
      .then((data) => setSports(data.sports || []))
  }, [])

  function toggleSport(sportId: string) {
    setSelectedSports((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/add-coach', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        phone,
        email,
        password,
        sportIds: selectedSports,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'حصلت مشكلة، حاول تاني')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif', padding: 20, background: '#fff', color: '#000' }}>
      <h1>إضافة مدرب جديد</h1>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginTop: 16 }}>
          الاسم بالكامل
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4 }}
            required
          />
        </label>

        <label style={{ display: 'block', marginTop: 16 }}>
          رقم التليفون
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4 }}
            required
          />
        </label>

        <label style={{ display: 'block', marginTop: 16 }}>
          الإيميل (لتسجيل الدخول)
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4 }}
            required
          />
        </label>

        <label style={{ display: 'block', marginTop: 16 }}>
          الباسورد (لتسجيل الدخول)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4 }}
            required
            minLength={6}
          />
        </label>

        <div style={{ marginTop: 16 }}>
          <p style={{ marginBottom: 8 }}>الرياضات اللي هيدربها (يمكن اختيار أكثر من واحدة)</p>
          {sports.length === 0 && <p style={{ color: '#999' }}>لا يوجد رياضات مسجلة بعد</p>}
          {sports.map((sport) => (
            <label key={sport.id} style={{ display: 'block', marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={selectedSports.includes(sport.id)}
                onChange={() => toggleSport(sport.id)}
                style={{ marginLeft: 8 }}
              />
              {sport.name}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 12, marginTop: 20, background: '#111', color: '#fff', border: 'none', borderRadius: 8 }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ المدرب'}
        </button>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  )
}