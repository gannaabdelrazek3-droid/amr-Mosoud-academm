'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Sport { id: string; name: string }

const cardStyle = { maxWidth: 560, margin: '40px auto', fontFamily: "'Tajawal', sans-serif", padding: 32, background: 'rgba(30,41,59,0.7)', color: '#e2e8f0', borderRadius: 16, border: '1px solid rgba(212,175,55,0.25)' }
const labelStyle = { display: 'block', marginTop: 20, fontSize: 16, fontWeight: 700, color: '#cbd5e1' }
const inputStyle = { width: '100%', padding: '14px 16px', marginTop: 8, fontSize: 16, border: '1px solid rgba(148,163,184,0.3)', borderRadius: 10, background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', boxSizing: 'border-box' as const }
const buttonStyle = { width: '100%', padding: 16, marginTop: 28, fontSize: 17, fontWeight: 700, background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 10, cursor: 'pointer' }

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
    fetch('/api/admin/sports').then((res) => res.json()).then((data) => setSports(data.sports || []))
  }, [])

  function toggleSport(sportId: string) {
    setSelectedSports((prev) => prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId])
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
      setError(data.error || 'حدثت مشكلة، حاول مرة أخرى')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div style={cardStyle}>
      <h1 style={{ color: '#f8fafc' }}>إضافة لاعب جديد</h1>
      <p style={{ color: '#94a3b8' }}>سيتم ربط اللاعب بك تلقائيًا</p>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>
          الاسم الكامل
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />
        </label>
        <label style={labelStyle}>
          رقم الهاتف
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          تاريخ الميلاد
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          الخلفية الرياضية (اختياري)
          <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={inputStyle} />
        </label>

        <div style={{ marginTop: 24 }}>
          <p style={{ ...labelStyle, marginTop: 0 }}>الرياضات (يمكن اختيار أكثر من واحدة)</p>
          {sports.map((sport) => (
            <label key={sport.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, marginBottom: 8 }}>
              <input type="checkbox" checked={selectedSports.includes(sport.id)} onChange={() => toggleSport(sport.id)} style={{ accentColor: '#d4af37' }} />
              {sport.name}
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={buttonStyle}>
          {loading ? 'جارٍ الحفظ...' : 'حفظ اللاعب'}
        </button>
        {error && <p style={{ color: '#fca5a5', marginTop: 14 }}>{error}</p>}
      </form>
    </div>
  )
}