'use client'

import { useState, useEffect, useCallback } from 'react'

interface Sport {
  id: string
  name: string
}

interface Skill {
  id: string
  name: string
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: 15,
  fontFamily: "'Tajawal', sans-serif",
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: 10,
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f1f5f9',
  boxSizing: 'border-box' as const,
  marginTop: 8,
}

export default function CoachSkillsPage() {
  const [sports, setSports] = useState<Sport[]>([])
  const [selectedSportId, setSelectedSportId] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [loadingSports, setLoadingSports] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/coach/sports')
      .then((res) => res.json())
      .then((data) => setSports(data.sports || []))
      .finally(() => setLoadingSports(false))
  }, [])

  const loadSkills = useCallback((sportId: string) => {
    fetch(`/api/coach/skills?sportId=${sportId}`)
      .then((res) => res.json())
      .then((data) => setSkills(data.skills || []))
  }, [])

  useEffect(() => {
    if (selectedSportId) {
      loadSkills(selectedSportId)
    } else {
      setSkills([])
    }
  }, [selectedSportId, loadSkills])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newSkill.trim() || !selectedSportId) return
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/coach/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sportId: selectedSportId, name: newSkill }),
    })

    setSaving(false)
    if (!res.ok) {
      setMessage('حدثت مشكلة، حاول مرة أخرى')
      return
    }
    setNewSkill('')
    loadSkills(selectedSportId)
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>مهارات رياضتي</h1>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>حدّد المهارات التي سيُقيَّم عليها اللاعبون في رياضتك</p>

        {loadingSports ? (
          <p>جارٍ التحميل...</p>
        ) : sports.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا توجد رياضات مسندة إليك حاليًا</p>
        ) : (
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 16, padding: 22 }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, fontSize: 14 }}>
              اختر الرياضة
              <select value={selectedSportId} onChange={(e) => setSelectedSportId(e.target.value)} style={inputStyle}>
                <option value="">اختر</option>
                {sports.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </label>

            {selectedSportId && (
              <>
                {skills.length === 0 ? (
                  <p style={{ color: '#94a3b8', marginTop: 16 }}>لا توجد مهارات مضافة لهذه الرياضة بعد</p>
                ) : (
                  <div style={{ marginTop: 16, marginBottom: 20 }}>
                    {skills.map((sk) => (
                      <div
                        key={sk.id}
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(15,23,42,0.4)',
                          borderRadius: 8,
                          marginBottom: 8,
                          color: '#e2e8f0',
                        }}
                      >
                        {sk.name}
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAdd}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, fontSize: 14, marginTop: 16 }}>
                    إضافة مهارة جديدة
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      style={inputStyle}
                      placeholder="مثال: لكمة أمامية"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: 12,
                      marginTop: 14,
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "'Tajawal', sans-serif",
                      background: '#d4af37',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                    }}
                  >
                    {saving ? 'جارٍ الإضافة...' : '+ إضافة مهارة'}
                  </button>
                  {message && <p style={{ color: '#fca5a5', marginTop: 10 }}>{message}</p>}
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}