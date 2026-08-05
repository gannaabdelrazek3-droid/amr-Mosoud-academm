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
            <h1 style={s.title}>إدارة الأنشطة</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إضافة وتعديل وحذف وإخفاء الأنشطة الرياضية بالأكاديمية</p>
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
          <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>النشاط</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الحالة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {sports.map((sport) => (
                  <tr key={sport.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>
                      {editingId === sport.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ ...s.input, margin: 0, padding: '6px 10px' }}
                          autoFocus
                        />
                      ) : (
                        sport.name
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={badge(sport.isActive)}>{sport.isActive ? 'مفعل' : 'غير مفعل'}</span>
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' as const }}>
                      {editingId === sport.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(sport.id)} style={saveBtn}>💾 حفظ</button>
                          <button onClick={() => setEditingId(null)} style={editBtn}>إلغاء</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(sport)} style={editBtn}>✏️ تعديل</button>
                          <button onClick={() => handleToggleActive(sport)} disabled={togglingId === sport.id} style={toggleBtnStyle}>
                            {togglingId === sport.id ? '...' : sport.isActive ? '🙈 إخفاء' : '👁️ إظهار'}
                          </button>
                          <button onClick={() => handleDelete(sport)} disabled={deletingId === sport.id} style={deleteBtnStyle}>
                            {deletingId === sport.id ? '...' : '🗑️ حذف'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}