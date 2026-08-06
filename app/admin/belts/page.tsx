'use client'

import { useState, useEffect } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface Belt {
  id: string
  name: string
  color: string | null
  isActive: boolean
  displayOrder: number
}

export default function BeltsManagementPage() {
  const [belts, setBelts] = useState<Belt[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#ffffff')
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#ffffff')

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  function loadBelts() {
    setLoading(true)
    fetch('/api/admin/belts-list')
      .then((res) => res.json())
      .then((data) => {
        if (data.belts) setBelts(data.belts)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBelts()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setMessage('')

    const res = await fetch('/api/admin/belts-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), color: newColor, displayOrder: belts.length }),
    })
    const data = await res.json()
    setAdding(false)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء إضافة الحزام')
      return
    }

    setBelts((prev) => [...prev, data.belt])
    setNewName('')
    setNewColor('#ffffff')
  }

  function startEdit(belt: Belt) {
    setEditingId(belt.id)
    setEditName(belt.name)
    setEditColor(belt.color || '#ffffff')
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return
    setMessage('')

    const res = await fetch('/api/admin/belts-list', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName.trim(), color: editColor }),
    })
    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء التعديل')
      return
    }

    setBelts((prev) => prev.map((b) => (b.id === id ? { ...b, name: editName.trim(), color: editColor } : b)))
    setEditingId(null)
  }

  async function handleToggleActive(belt: Belt) {
    setTogglingId(belt.id)
    setMessage('')

    const res = await fetch('/api/admin/belts-list', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: belt.id, isActive: !belt.isActive }),
    })
    const data = await res.json()
    setTogglingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء تحديث الحالة')
      return
    }

    setBelts((prev) => prev.map((b) => (b.id === belt.id ? { ...b, isActive: !b.isActive } : b)))
  }

  async function handleDelete(belt: Belt) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف حزام "${belt.name}"؟`)
    if (!confirmed) return

    setDeletingId(belt.id)
    setMessage('')

    const res = await fetch(`/api/admin/belts-list?id=${belt.id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeletingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء الحذف')
      return
    }

    setBelts((prev) => prev.filter((b) => b.id !== belt.id))
  }

  async function handleMove(belt: Belt, direction: 'up' | 'down') {
    const index = belts.findIndex((b) => b.id === belt.id)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= belts.length) return

    const target = belts[targetIndex]
    setReorderingId(belt.id)
    setMessage('')

    const [res1, res2] = await Promise.all([
      fetch('/api/admin/belts-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: belt.id, displayOrder: target.displayOrder }),
      }),
      fetch('/api/admin/belts-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: target.id, displayOrder: belt.displayOrder }),
      }),
    ])
    setReorderingId(null)

    if (!res1.ok || !res2.ok) {
      setMessage('حدث خطأ أثناء تغيير الترتيب')
      return
    }

    const newBelts = [...belts]
    newBelts[index] = { ...target, displayOrder: belt.displayOrder }
    newBelts[targetIndex] = { ...belt, displayOrder: target.displayOrder }
    newBelts.sort((a, b) => a.displayOrder - b.displayOrder)
    setBelts(newBelts)
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
  const moveBtnStyle = { ...actionBtn, background: 'rgba(148,163,184,0.15)', color: '#94a3b8', padding: '6px 9px' }
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
            <h1 style={s.title}>إدارة الأحزمة</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إضافة وتعديل وحذف وترتيب أحزمة اللاعبين</p>
          </div>
        </div>

        {message && <p style={{ ...s.error, marginBottom: 15 }}>{message}</p>}

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={{ color: '#d4af37', fontSize: 16, fontWeight: 900, margin: '0 0 14px' }}>➕ إضافة حزام جديد</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ ...s.input, flex: 1, minWidth: 200, margin: 0 }}
              placeholder="مثال: أسود دان 2"
              required
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              style={{ width: 50, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
              title="اختر اللون"
            />
            <button type="submit" disabled={adding} className="btn-primary" style={{ ...s.button, width: 'auto', padding: '0 24px' }}>
              {adding ? 'جارٍ الإضافة...' : 'إضافة'}
            </button>
          </form>
        </div>

        {belts.length === 0 ? (
          <div style={s.formCard}>
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>لا توجد أحزمة مضافة بعد</p>
          </div>
        ) : (
          <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الترتيب</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>اللون</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>اسم الحزام</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الحالة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {belts.map((belt, idx) => (
                  <tr key={belt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' as const }}>
                      <button onClick={() => handleMove(belt, 'up')} disabled={idx === 0 || reorderingId !== null} style={moveBtnStyle}>⬆️</button>
                      <button onClick={() => handleMove(belt, 'down')} disabled={idx === belts.length - 1 || reorderingId !== null} style={moveBtnStyle}>⬇️</button>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {editingId === belt.id ? (
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          style={{ width: 40, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0 }}
                        />
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: belt.color || '#94a3b8',
                            border: '1px solid rgba(255,255,255,0.3)',
                          }}
                        />
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>
                      {editingId === belt.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ ...s.input, margin: 0, padding: '6px 10px' }}
                          autoFocus
                        />
                      ) : (
                        belt.name
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={badge(belt.isActive)}>{belt.isActive ? 'مفعل' : 'غير مفعل'}</span>
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' as const }}>
                      {editingId === belt.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(belt.id)} style={saveBtn}>💾 حفظ</button>
                          <button onClick={() => setEditingId(null)} style={editBtn}>إلغاء</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(belt)} style={editBtn}>✏️ تعديل</button>
                          <button onClick={() => handleToggleActive(belt)} disabled={togglingId === belt.id} style={toggleBtnStyle}>
                            {togglingId === belt.id ? '...' : belt.isActive ? '🙈 إخفاء' : '👁️ إظهار'}
                          </button>
                          <button onClick={() => handleDelete(belt)} disabled={deletingId === belt.id} style={deleteBtnStyle}>
                            {deletingId === belt.id ? '...' : '🗑️ حذف'}
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