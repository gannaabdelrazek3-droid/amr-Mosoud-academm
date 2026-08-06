'use client'

import { useState, useEffect } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface Sport {
  id: string
  name: string
  isActive: boolean
  displayOrder: number
}

interface Skill {
  id: string
  name: string
  sportId: string
}

export default function SportsManagementPage() {
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // إدارة المهارات
  const [expandedSportId, setExpandedSportId] = useState<string | null>(null)
  const [skillsMap, setSkillsMap] = useState<Record<string, Skill[]>>({})
  const [loadingSkills, setLoadingSkills] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [editSkillName, setEditSkillName] = useState('')
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null)

  function loadSports() {
    setLoading(true)
    fetch('/api/admin/sports-list')
      .then((res) => res.json())
      .then((data) => {
        if (data.sports) setSports(data.sports)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSports()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setMessage('')

    const res = await fetch('/api/admin/sports-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), displayOrder: sports.length }),
    })
    const data = await res.json()
    setAdding(false)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء إضافة النشاط')
      return
    }

    setSports((prev) => [...prev, data.sport])
    setNewName('')
  }

  function startEdit(sport: Sport) {
    setEditingId(sport.id)
    setEditName(sport.name)
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return
    setMessage('')

    const res = await fetch('/api/admin/sports-list', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName.trim() }),
    })
    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء التعديل')
      return
    }

    setSports((prev) => prev.map((sp) => (sp.id === id ? { ...sp, name: editName.trim() } : sp)))
    setEditingId(null)
  }

  async function handleToggleActive(sport: Sport) {
    setTogglingId(sport.id)
    setMessage('')

    const res = await fetch('/api/admin/sports-list', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sport.id, isActive: !sport.isActive }),
    })
    const data = await res.json()
    setTogglingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء تحديث الحالة')
      return
    }

    setSports((prev) => prev.map((sp) => (sp.id === sport.id ? { ...sp, isActive: !sp.isActive } : sp)))
  }

  async function handleDelete(sport: Sport) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف نشاط "${sport.name}"؟ لن يمكن التراجع.`)
    if (!confirmed) return

    setDeletingId(sport.id)
    setMessage('')

    const res = await fetch(`/api/admin/sports-list?id=${sport.id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeletingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء الحذف')
      return
    }

    setSports((prev) => prev.filter((sp) => sp.id !== sport.id))
  }

  // === المهارات ===
  function toggleSkillsSection(sport: Sport) {
    if (expandedSportId === sport.id) {
      setExpandedSportId(null)
      return
    }
    setExpandedSportId(sport.id)
    setNewSkillName('')
    setEditingSkillId(null)

    if (!skillsMap[sport.id]) {
      setLoadingSkills(true)
      fetch(`/api/admin/skills-manage?sportId=${sport.id}`)
        .then((res) => res.json())
        .then((data) => {
          setSkillsMap((prev) => ({ ...prev, [sport.id]: data.skills || [] }))
        })
        .finally(() => setLoadingSkills(false))
    }
  }

  async function handleAddSkill(e: React.FormEvent, sportId: string) {
    e.preventDefault()
    if (!newSkillName.trim()) return
    setAddingSkill(true)
    setMessage('')

    const res = await fetch('/api/admin/skills-manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sportId, name: newSkillName.trim() }),
    })
    const data = await res.json()
    setAddingSkill(false)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء إضافة المهارة')
      return
    }

    setSkillsMap((prev) => ({ ...prev, [sportId]: [...(prev[sportId] || []), data.skill] }))
    setNewSkillName('')
  }

  function startEditSkill(skill: Skill) {
    setEditingSkillId(skill.id)
    setEditSkillName(skill.name)
  }

  async function handleSaveEditSkill(skill: Skill) {
    if (!editSkillName.trim()) return
    setMessage('')

    const res = await fetch('/api/admin/skills-manage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: skill.id, name: editSkillName.trim() }),
    })
    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء التعديل')
      return
    }

    setSkillsMap((prev) => ({
      ...prev,
      [skill.sportId]: (prev[skill.sportId] || []).map((sk) => (sk.id === skill.id ? { ...sk, name: editSkillName.trim() } : sk)),
    }))
    setEditingSkillId(null)
  }

  async function handleDeleteSkill(skill: Skill) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف مهارة "${skill.name}"؟`)
    if (!confirmed) return

    setDeletingSkillId(skill.id)
    setMessage('')

    const res = await fetch(`/api/admin/skills-manage?id=${skill.id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeletingSkillId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء الحذف')
      return
    }

    setSkillsMap((prev) => ({
      ...prev,
      [skill.sportId]: (prev[skill.sportId] || []).filter((sk) => sk.id !== skill.id),
    }))
  }

  if (loading) {
    return (
      <AdminShell fullName="">
        <div style={s.page}>
          <p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p>
        </div>
      </AdminShell>
    )
  }

  const actionBtn = { border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, marginLeft: 6 }
  const editBtn = { ...actionBtn, background: 'rgba(212,175,55,0.15)', color: '#d4af37' }
  const saveBtn = { ...actionBtn, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
  const deleteBtnStyle = { ...actionBtn, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
  const toggleBtnStyle = { ...actionBtn, background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
  const skillsBtnStyle = { ...actionBtn, background: 'rgba(168,85,247,0.15)', color: '#c084fc' }
  const badge = (active: boolean) => ({
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background: active ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
    color: active ? '#22c55e' : '#94a3b8',
    border: `1px solid ${active ? 'rgba(34,197,94,0.4)' : 'rgba(148,163,184,0.4)'}`,
  })

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>إدارة الأنشطة والمهارات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إضافة وتعديل وحذف وإخفاء الأنشطة، وإدارة مهارات كل نشاط</p>
          </div>
        </div>

        {message && <p style={{ ...s.error, marginBottom: 15 }}>{message}</p>}

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={{ color: '#d4af37', fontSize: 16, fontWeight: 900, margin: '0 0 14px' }}>➕ إضافة نشاط جديد</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ ...s.input, flex: 1, minWidth: 200 }}
              placeholder="مثال: تايكوندو"
              required
            />
            <button type="submit" disabled={adding} className="btn-primary" style={{ ...s.button, width: 'auto', padding: '0 24px' }}>
              {adding ? 'جارٍ الإضافة...' : 'إضافة'}
            </button>
          </form>
        </div>

        {sports.length === 0 ? (
          <div style={s.formCard}>
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>لا توجد أنشطة مضافة بعد</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sports.map((sport) => (
              <div key={sport.id} style={{ ...s.formCard, padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 200 }}>
                    {editingId === sport.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ ...s.input, margin: 0, padding: '6px 10px', flex: 1 }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>{sport.name}</span>
                    )}
                    <span style={badge(sport.isActive)}>{sport.isActive ? 'مفعل' : 'غير مفعل'}</span>
                  </div>

                  <div style={{ whiteSpace: 'nowrap' as const }}>
                    {editingId === sport.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(sport.id)} style={saveBtn}>💾 حفظ</button>
                        <button onClick={() => setEditingId(null)} style={editBtn}>إلغاء</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => toggleSkillsSection(sport)} style={skillsBtnStyle}>
                          🎯 المهارات {expandedSportId === sport.id ? '▲' : '▼'}
                        </button>
                        <button onClick={() => startEdit(sport)} style={editBtn}>✏️ تعديل</button>
                        <button onClick={() => handleToggleActive(sport)} disabled={togglingId === sport.id} style={toggleBtnStyle}>
                          {togglingId === sport.id ? '...' : sport.isActive ? '🙈 إخفاء' : '👁️ إظهار'}
                        </button>
                        <button onClick={() => handleDelete(sport)} disabled={deletingId === sport.id} style={deleteBtnStyle}>
                          {deletingId === sport.id ? '...' : '🗑️ حذف'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expandedSportId === sport.id && (
                  <div style={{ borderTop: '1px solid rgba(212,175,55,0.15)', padding: 16, background: 'rgba(212,175,55,0.03)' }}>
                    <h4 style={{ color: '#c084fc', fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>🎯 مهارات {sport.name}</h4>

                    {loadingSkills && !skillsMap[sport.id] ? (
                      <p style={{ color: '#94a3b8', fontSize: 13 }}>جارٍ التحميل...</p>
                    ) : (
                      <>
                        {(skillsMap[sport.id] || []).length === 0 ? (
                          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>لا توجد مهارات مضافة لهذا النشاط بعد</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                            {(skillsMap[sport.id] || []).map((skill) => (
                              <div
                                key={skill.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: 'rgba(15,23,42,0.5)',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                }}
                              >
                                {editingSkillId === skill.id ? (
                                  <input
                                    type="text"
                                    value={editSkillName}
                                    onChange={(e) => setEditSkillName(e.target.value)}
                                    style={{ ...s.input, margin: 0, padding: '6px 10px', flex: 1 }}
                                    autoFocus
                                  />
                                ) : (
                                  <span style={{ color: '#e2e8f0', fontSize: 14 }}>{skill.name}</span>
                                )}
                                <div style={{ whiteSpace: 'nowrap' as const }}>
                                  {editingSkillId === skill.id ? (
                                    <>
                                      <button onClick={() => handleSaveEditSkill(skill)} style={saveBtn}>💾</button>
                                      <button onClick={() => setEditingSkillId(null)} style={editBtn}>✕</button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => startEditSkill(skill)} style={editBtn}>✏️</button>
                                      <button onClick={() => handleDeleteSkill(skill)} disabled={deletingSkillId === skill.id} style={deleteBtnStyle}>
                                        {deletingSkillId === skill.id ? '...' : '🗑️'}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <form onSubmit={(e) => handleAddSkill(e, sport.id)} style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            style={{ ...s.input, margin: 0, flex: 1 }}
                            placeholder="مثال: التوازن"
                            required
                          />
                          <button type="submit" disabled={addingSkill} className="btn-primary" style={{ ...s.button, width: 'auto', padding: '0 18px', margin: 0 }}>
                            {addingSkill ? '...' : '+ إضافة'}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}