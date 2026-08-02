'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface Tournament {
  id: string
  name: string
  date: string
  location: string | null
  isActive: boolean
  media: { id: string }[]
  participants: { id: string }[]
}

export default function TournamentsListPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/tournaments')
      .then((res) => res.json())
      .then((data) => {
        if (data.tournaments) setTournaments(data.tournaments)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(t: Tournament) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف بطولة "${t.name}"؟`)
    if (!confirmed) return

    setDeletingId(t.id)
    setMessage('')

    const res = await fetch(`/api/admin/tournaments?id=${t.id}`, { method: 'DELETE' })
    const data = await res.json()

    setDeletingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء حذف البطولة')
      return
    }

    setTournaments((prev) => prev.filter((x) => x.id !== t.id))
  }

  async function handleToggleActive(t: Tournament) {
    setTogglingId(t.id)
    setMessage('')

    const res = await fetch('/api/admin/tournaments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, isActive: !t.isActive }),
    })
    const data = await res.json()

    setTogglingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء تحديث الحالة')
      return
    }

    setTournaments((prev) => prev.map((x) => (x.id === t.id ? { ...x, isActive: !x.isActive } : x)))
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
            <h1 style={s.title}>إدارة البطولات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إضافة وتعديل وحذف بطولات الأكاديمية</p>
          </div>
          <Link href="/admin/add-tournament" className="btn-primary" style={{ ...s.button, textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            ➕ إضافة بطولة جديدة
          </Link>
        </div>

        {message && <p style={{ ...s.error, marginBottom: 15 }}>{message}</p>}

        {tournaments.length === 0 ? (
          <div style={s.formCard}>
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>لا توجد بطولات مضافة بعد</p>
          </div>
        ) : (
          <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الاسم</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>التاريخ</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>المكان</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الوسائط</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الحالة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>{t.name}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{t.location || '—'}</td>
                    <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{t.media.length} ملف</td>
                    <td style={{ padding: '12px' }}>
                      <span style={badge(t.isActive)}>{t.isActive ? 'نشطة' : 'غير نشطة'}</span>
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' as const }}>
                      <Link href={`/admin/edit-tournament?id=${t.id}`} style={{ ...editBtn, textDecoration: 'none', display: 'inline-block' }}>
                        ✏️ تعديل
                      </Link>
                      <button onClick={() => handleToggleActive(t)} disabled={togglingId === t.id} style={toggleBtnStyle}>
                        {togglingId === t.id ? '...' : t.isActive ? '🙈 إخفاء' : '👁️ إظهار'}
                      </button>
                      <button onClick={() => handleDelete(t)} disabled={deletingId === t.id} style={deleteBtnStyle}>
                        {deletingId === t.id ? '...' : '🗑️ حذف'}
                      </button>
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