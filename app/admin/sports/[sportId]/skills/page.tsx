'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { adminStyles as s } from '../../../adminStyles'

interface Skill {
  id: string
  name: string
}

export default function SportSkillsPage() {
  const params = useParams()
  const sportId = params.sportId as string

  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function loadSkills() {
    setLoading(true)
    fetch(`/api/admin/skills?sportId=${sportId}`)
      .then((res) => res.json())
      .then((data) => setSkills(data.skills || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (sportId) loadSkills()
  }, [sportId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newSkill.trim()) return

    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/skills', {
      method: 'POST',
      body: JSON.stringify({ sportId, name: newSkill }),
    })

    setSaving(false)

    if (!res.ok) {
      setMessage('حصلت مشكلة، حاول تاني')
      return
    }

    setNewSkill('')
    loadSkills()
  }

  if (loading) {
    return <div style={s.page}><p>جاري التحميل...</p></div>
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>مهارات الرياضة</h1>
      <p style={s.subtitle}>حددي المهارات اللي هيتقيّم عليها اللاعب في الرياضة دي (زي: بوكس، مصارعة، ضربات رجل)</p>

      {skills.length === 0 ? (
        <p style={{ color: '#999', marginBottom: 20 }}>لسه مفيش مهارات مضافة لهذه الرياضة</p>
      ) : (
        <div style={{ marginBottom: 24 }}>
          {skills.map((sk) => (
            <div key={sk.id} style={s.checkboxLabel}>
              <span>{sk.name}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd}>
        <label style={s.label}>
          إضافة مهارة جديدة
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            style={s.input}
            placeholder="مثال: بوكس"
          />
        </label>

        <button type="submit" disabled={saving} style={s.button}>
          {saving ? 'جاري الإضافة...' : '+ إضافة مهارة'}
        </button>

        {message && <p style={s.error}>{message}</p>}
      </form>
    </div>
  )
}