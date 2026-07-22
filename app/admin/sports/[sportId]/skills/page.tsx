'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { adminStyles as s } from '../../../adminStyles'
import AdminShell from '../../../AdminShell'

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
      setMessage('حدثت مشكلة، حاول مرة أخرى')
      return
    }
    setNewSkill('')
    loadSkills()
  }

  if (loading) {
    return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>مهارات الرياضة</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>حدّد المهارات التي سيُقيَّم عليها اللاعب في هذه الرياضة</p>
          </div>
        </div>

        <div style={s.formCard}>
          {skills.length === 0 ? (
            <p style={{ color: '#94a3b8', marginBottom: 20 }}>لا توجد مهارات مضافة لهذه الرياضة بعد</p>
          ) : (
            <div style={{ marginBottom: 24 }}>
              {skills.map((sk) => (
                <div key={sk.id} style={s.checkboxLabel}><span>{sk.name}</span></div>
              ))}
            </div>
          )}

          <form onSubmit={handleAdd}>
            <label style={s.label}>
              إضافة مهارة جديدة
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} style={s.input} placeholder="مثال: الملاكمة" />
            </label>

            <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
              {saving ? 'جارٍ الإضافة...' : '+ إضافة مهارة'}
            </button>

            {message && <p style={s.error}>{message}</p>}
          </form>
        </div>
      </div>
    </AdminShell>
  )
}