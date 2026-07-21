'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { adminStyles as s } from '../../adminStyles'
import Link from 'next/link'

interface Player {
  id: string
  fullName: string
}

export default function SportPage() {
  const params = useParams()
  const sportId = params.sportId as string

  const [players, setPlayers] = useState<Player[]>([])
  const [sportName, setSportName] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [present, setPresent] = useState(true)
  const [rating, setRating] = useState('3')
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sportId) return
    fetch(`/api/admin/sport-players?sportId=${sportId}`)
      .then((res) => res.json())
      .then((data) => setPlayers(data.players || []))
      .finally(() => setLoading(false))
  }, [sportId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlayerId) {
      setMessage('اختار لاعب الأول')
      return
    }

    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/sport-log', {
      method: 'POST',
      body: JSON.stringify({
        playerId: selectedPlayerId,
        sportId,
        present,
        rating,
        weight,
        note,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      setMessage('حصلت مشكلة، حاول تاني')
      return
    }

    setMessage('تم الحفظ بنجاح')
    setWeight('')
    setNote('')
  }

  if (loading) {
    return <div style={s.page}><p>جاري التحميل...</p></div>
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>حضور وتقييم اللاعبين</h1>
      <p style={s.subtitle}>عدد اللاعبين المسجلين في الرياضة دي: {players.length}</p>
<Link href={`/admin/sports/${sportId}/skills`} style={{ display: 'inline-block', marginBottom: 20, color: '#111', textDecoration: 'underline' }}>
  ⚙️ إدارة مهارات هذه الرياضة
</Link>
      {players.length === 0 ? (
        <p style={{ color: '#999' }}>لا يوجد لاعبين مسجلين في الرياضة دي</p>
      ) : (
        <form onSubmit={handleSave}>
          <label style={s.label}>
            اختار اللاعب
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              style={s.input}
              required
            >
              <option value="">-- اختار لاعب --</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </label>

          <label style={s.checkboxLabel}>
            <input
              type="checkbox"
              checked={present}
              onChange={(e) => setPresent(e.target.checked)}
              style={s.checkbox}
            />
            حضر النهاردة
          </label>

          <label style={s.label}>
            التقييم (1 لـ 5)
            <select value={rating} onChange={(e) => setRating(e.target.value)} style={s.input}>
              <option value="1">1 ⭐</option>
              <option value="2">2 ⭐⭐</option>
              <option value="3">3 ⭐⭐⭐</option>
              <option value="4">4 ⭐⭐⭐⭐</option>
              <option value="5">5 ⭐⭐⭐⭐⭐</option>
            </select>
          </label>

          <label style={s.label}>
            الوزن (كجم) - اختياري
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={s.input}
            />
          </label>

          <label style={s.label}>
            ملاحظة (اختياري)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ ...s.input, minHeight: 80 }}
            />
          </label>

          <button type="submit" disabled={saving} style={s.button}>
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>

          {message && <p style={s.error}>{message}</p>}
        </form>
      )}
    </div>
  )
}