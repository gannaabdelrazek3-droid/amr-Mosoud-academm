'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../../admin/adminStyles'

interface Sport {
  id: string
  name: string
}

export default function CoachAddPlayerPage() {
  const router = useRouter()
  const [sports, setSports] = useState<Sport[]>([])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
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

    const res = await fetch('/api/coach/add-player', {
      method: 'POST',
      body: JSON.stringify({ fullName, phone, birthDate, sportsBackground, sportIds: selectedSports }),
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
    <div style={s.page}>
      <h1 style={s.title}>إضافة لاعب جديد</h1>
      <p style={s.subtitle}>هيتربط اللاعب بيك تلقائيًا</p>

      <form onSubmit={handleSubmit}>
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
          خلفية رياضية (اختياري)
          <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={s.input} />
        </label>

        <div style={{ marginTop: 24 }}>
         
        </div>

        <button type="submit" disabled={loading} style={s.button}>
          {loading ? 'جاري الحفظ...' : 'حفظ اللاعب'}
        </button>

        {error && <p style={s.error}>{error}</p>}
      </form>
    </div>
  )
}