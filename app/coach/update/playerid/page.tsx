'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const cardStyle = { maxWidth: 560, margin: '40px auto', fontFamily: "'Tajawal', sans-serif", padding: 32, background: 'rgba(30,41,59,0.7)', color: '#e2e8f0', borderRadius: 16, border: '1px solid rgba(212,175,55,0.25)' }
const labelStyle = { display: 'block', marginTop: 20, fontSize: 16, fontWeight: 700, color: '#cbd5e1' }
const inputStyle = { width: '100%', padding: '14px 16px', marginTop: 8, fontSize: 16, border: '1px solid rgba(148,163,184,0.3)', borderRadius: 10, background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', boxSizing: 'border-box' as const }
const buttonStyle = { width: '100%', padding: 16, marginTop: 20, fontSize: 17, fontWeight: 700, background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 10, cursor: 'pointer' }

export default function UpdatePlayerPage({ params }: { params: Promise<{ playerid: string }> }) {
  const router = useRouter()
  const [playerId, setPlayerId] = useState('')
  const [weight, setWeight] = useState('')
  const [rating, setRating] = useState('3')
  const [present, setPresent] = useState(true)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [freezeLoading, setFreezeLoading] = useState(false)
  const [freezeMessage, setFreezeMessage] = useState('')

  useEffect(() => { params.then((p) => setPlayerId(p.playerid)) }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/coach/update-player', {
      method: 'POST',
      body: JSON.stringify({ playerId, weight: weight ? parseFloat(weight) : null, rating: parseInt(rating), present, note }),
    })
    setLoading(false)
    if (!res.ok) { setError('حدثت مشكلة، حاول مرة أخرى'); return }
    router.push('/dashboard')
  }

  async function handleToggleFreeze() {
    setFreezeLoading(true)
    setFreezeMessage('')
    const res = await fetch('/api/coach/toggle-freeze', {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    })
    setFreezeLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setFreezeMessage(data.error || 'حدثت مشكلة')
      return
    }
    const data = await res.json()
    setFreezeMessage(data.isFrozen ? 'تم تجميد الاشتراك' : 'تم فك التجميد وإضافة الأيام تلقائيًا')
  }

  return (
    <div style={cardStyle}>
      <h1 style={{ color: '#f8fafc' }}>تسجيل بيانات اللاعب</h1>

      <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 10px', color: '#f8fafc' }}>🧊 حالة الاشتراك</h3>
        <button type="button" onClick={handleToggleFreeze} disabled={freezeLoading} className="btn-primary" style={{ padding: '8px 16px', background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 700 }}>
          {freezeLoading ? 'جارٍ التنفيذ...' : 'تجميد / فك التجميد'}
        </button>
        {freezeMessage && <p style={{ marginTop: 8, color: '#e2e8f0' }}>{freezeMessage}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>
          الوزن (كجم) - اختياري
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          التقييم (1 إلى 5)
          <select value={rating} onChange={(e) => setRating(e.target.value)} style={inputStyle}>
            <option value="1">1 ⭐</option>
            <option value="2">2 ⭐⭐</option>
            <option value="3">3 ⭐⭐⭐</option>
            <option value="4">4 ⭐⭐⭐⭐</option>
            <option value="5">5 ⭐⭐⭐⭐⭐</option>
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, color: '#e2e8f0' }}>
          <input type="checkbox" checked={present} onChange={(e) => setPresent(e.target.checked)} style={{ accentColor: '#d4af37' }} />
          حضر اليوم
        </label>

        <label style={labelStyle}>
          ملاحظة (اختياري)
          <textarea value={note} onChange={(e) => setNote(e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />
        </label>

        <button type="submit" disabled={loading} className="btn-primary" style={buttonStyle}>
          {loading ? 'جارٍ الحفظ...' : 'حفظ'}
        </button>
        {error && <p style={{ color: '#fca5a5', marginTop: 14 }}>{error}</p>}
      </form>
    </div>
  )
}