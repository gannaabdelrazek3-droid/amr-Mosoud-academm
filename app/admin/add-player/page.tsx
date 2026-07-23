'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'

interface Sport {
  id: string
  name: string
}

export default function AddPlayerPage() {
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

    const res = await fetch('/api/admin/add-player', {
      method: 'POST',
      body: JSON.stringify({ fullName, phone, birthDate, sportsBackground, sportIds: selectedSports }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'حدثت مشكلة، حاول مرة أخرى')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={s.page}>
      <div style={s.headerBar}>
        <div>
          <h1 style={s.title}>إضافة لاعب جديد</h1>
          <p style={{ color: '#64748b', margin: 0 }}>سجّل بيانات اللاعب وحدّد الرياضات التي سيمارسها</p>
        </div>
      </div>

      <div style={s.formCard}>
        <form onSubmit={handleSubmit}>
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
            الخلفية الرياضية (اختياري)
            <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={s.input} />
          </label>

          <div style={{ marginTop: 24 }}>
            <p style={{ ...s.label, marginTop: 0 }}>الرياضات (يمكن اختيار أكثر من واحدة)</p>
            {sports.length === 0 && <p style={{ color: '#999' }}>لا توجد رياضات مسجّلة بعد</p>}
            {sports.map((sport) => (
              <label key={sport.id} style={s.checkboxLabel}>
                <input type="checkbox" checked={selectedSports.includes(sport.id)} onChange={() => toggleSport(sport.id)} style={s.checkbox} />
                {sport.name}
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={s.button}>
            {loading ? 'جارٍ الحفظ...' : 'حفظ اللاعب'}
          </button>

          {error && <p style={s.error}>{error}</p>}
        </form>
      </div>
    </div>
  )
}