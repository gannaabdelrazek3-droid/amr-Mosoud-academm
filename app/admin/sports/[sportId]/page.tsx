'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { adminStyles as s } from '../../adminStyles'
import AdminShell from '../../AdminShell'

interface Player {
  id: string
  fullName: string
}

interface Skill {
  id: string
  name: string
}

export default function SportPage() {
  const params = useParams()
  const sportId = params.sportId as string

  const [players, setPlayers] = useState<Player[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [present, setPresent] = useState(true)
  const [rating, setRating] = useState('3')
  const [skillValues, setSkillValues] = useState<Record<string, number>>({})
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sportId) return

    Promise.all([
      fetch(`/api/admin/sport-players?sportId=${sportId}`).then((res) => res.json()),
      fetch(`/api/admin/skills?sportId=${sportId}`).then((res) => res.json()),
    ])
      .then(([playersData, skillsData]) => {
        setPlayers(playersData.players || [])
        const fetchedSkills: Skill[] = skillsData.skills || []
        setSkills(fetchedSkills)
        const initialValues: Record<string, number> = {}
        fetchedSkills.forEach((sk) => { initialValues[sk.id] = 50 })
        setSkillValues(initialValues)
      })
      .finally(() => setLoading(false))
  }, [sportId])

  function handleSkillChange(skillId: string, value: number) {
    setSkillValues((prev) => ({ ...prev, [skillId]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlayerId) {
      setMessage('اختر لاعبًا أولاً')
      return
    }

    setSaving(true)
    setMessage('')

    const sportLogRes = await fetch('/api/admin/sport-log', {
      method: 'POST',
      body: JSON.stringify({
        playerId: selectedPlayerId,
        sportId,
        present,
        rating: skills.length === 0 ? rating : undefined,
        weight,
        note,
      }),
    })

    if (!sportLogRes.ok) {
      setSaving(false)
      setMessage('حدثت مشكلة، حاول مرة أخرى')
      return
    }

    if (skills.length > 0) {
      const ratingsPayload = skills.map((sk) => ({ skillId: sk.id, value: skillValues[sk.id] ?? 50 }))
      const skillRes = await fetch('/api/admin/skill-ratings', {
        method: 'POST',
        body: JSON.stringify({ playerId: selectedPlayerId, ratings: ratingsPayload }),
      })
      if (!skillRes.ok) {
        setSaving(false)
        setMessage('تم حفظ الحضور، لكن حدثت مشكلة في حفظ المهارات')
        return
      }
    }

    setSaving(false)
    setMessage('تم الحفظ بنجاح')
    setWeight('')
    setNote('')
  }

  if (loading) {
    return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>حضور وتقييم اللاعبين</h1>
            <Link href={`/admin/sports/${sportId}/skills`} style={{ color: '#d4af37', textDecoration: 'underline', fontSize: 14 }}>
              ⚙️ إدارة مهارات هذه الرياضة
            </Link>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>عدد اللاعبين المسجّلين: {players.length}</p>
          </div>
        </div>

        {players.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا يوجد لاعبون مسجّلون في هذه الرياضة</p>
        ) : (
          <div style={s.formCard}>
            <form onSubmit={handleSave}>
              <label style={s.label}>
                اختر اللاعب
                <select value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)} style={s.input} required>
                  <option value="">-- اختر لاعبًا --</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </label>

              <label style={s.checkboxLabel}>
                <input type="checkbox" checked={present} onChange={(e) => setPresent(e.target.checked)} style={s.checkbox} />
                حضر اليوم
              </label>

              {skills.length > 0 ? (
                <div style={{ marginTop: 20 }}>
                  <p style={{ ...s.label, marginTop: 0 }}>تقييم المهارات</p>
                  {skills.map((sk) => (
                    <div key={sk.id} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 6, color: '#e2e8f0' }}>
                        <span>{sk.name}</span>
                        <strong style={{ color: '#d4af37' }}>{skillValues[sk.id] ?? 50}%</strong>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={skillValues[sk.id] ?? 50}
                        onChange={(e) => handleSkillChange(sk.id, parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: '#d4af37' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <label style={s.label}>
                  التقييم العام (1 إلى 5)
                  <select value={rating} onChange={(e) => setRating(e.target.value)} style={s.input}>
                    <option value="1">1 ⭐</option>
                    <option value="2">2 ⭐⭐</option>
                    <option value="3">3 ⭐⭐⭐</option>
                    <option value="4">4 ⭐⭐⭐⭐</option>
                    <option value="5">5 ⭐⭐⭐⭐⭐</option>
                  </select>
                </label>
              )}

              <label style={s.label}>
                الوزن (كجم) - اختياري
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} style={s.input} />
              </label>

              <label style={s.label}>
                ملاحظة (اختياري)
                <textarea value={note} onChange={(e) => setNote(e.target.value)} style={{ ...s.input, minHeight: 80 }} />
              </label>

              <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>

              {message && <p style={s.error}>{message}</p>}
            </form>
          </div>
        )}
      </div>
    </AdminShell>
  )
}