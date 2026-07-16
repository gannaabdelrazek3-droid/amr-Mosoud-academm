'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    params.then((p) => setPlayerId(p.playerid))
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/coach/update-player', {
      method: 'POST',
      body: JSON.stringify({
        playerId: playerId,
        weight: weight ? parseFloat(weight) : null,
        rating: parseInt(rating),
        present,
        note,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('حصلت مشكلة، حاول تاني')
      return
    }

    router.push('/dashboard')
  }

  async function handleToggleFreeze() {
    setFreezeLoading(true)
    setFreezeMessage('')

    const res = await fetch('/api/coach/toggle-freeze', {
      method: 'POST',
      body: JSON.stringify({ playerId: playerId }),
    })

    setFreezeLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setFreezeMessage(data.error || 'حصلت مشكلة')
      return
    }

    const data = await res.json()
    setFreezeMessage(data.isFrozen ? 'تم تجميد الاشتراك' : 'تم فك التجميد وإضافة الأيام تلقائياً')
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif', padding: 20, background: '#fff', color: '#000' }}>
      <h1>تسجيل بيانات اللاعب</h1>

      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 10px' }}>🧊 حالة الاشتراك</h3>
        <button
          type="button"
          onClick={handleToggleFreeze}
          disabled={freezeLoading}
          style={{ padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 8 }}
        >
          {freezeLoading ? 'جاري التنفيذ...' : 'تجميد / فك التجميد'}
        </button>
        {freezeMessage && <p style={{ marginTop: 8, color: '#333' }}>{freezeMessage}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginTop: 16 }}>
          الوزن (كجم) - اختياري
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4 }}
          />
        </label>

        <label style={{ display: 'block', marginTop: 16 }}>
          التقييم (1 لـ 5)
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4 }}
          >
            <option value="1">1 ⭐</option>
            <option value="2">2 ⭐⭐</option>
            <option value="3">3 ⭐⭐⭐</option>
            <option value="4">4 ⭐⭐⭐⭐</option>
            <option value="5">5 ⭐⭐⭐⭐⭐</option>
          </select>
        </label>

        <label style={{ display: 'block', marginTop: 16 }}>
          <input
            type="checkbox"
            checked={present}
            onChange={(e) => setPresent(e.target.checked)}
          />
          {' '}حضر النهاردة
        </label>

        <label style={{ display: 'block', marginTop: 16 }}>
          ملاحظة (اختياري)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4, minHeight: 80 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 12, marginTop: 20, background: '#111', color: '#fff', border: 'none', borderRadius: 8 }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </button>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  )
}