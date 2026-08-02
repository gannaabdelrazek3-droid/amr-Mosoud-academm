'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface FeaturedPlayer {
  id: string
  season: number
  name: string
  imageUrl: string | null
  sport: string | null
  achievement: string | null
  isActive: boolean
}

export default function FeaturedPlayersListPage() {
  const [players, setPlayers] = useState<FeaturedPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/featured-players')
      .then((res) => res.json())
      .then((data) => {
        if (data.players) setPlayers(data.players)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(p: FeaturedPlayer) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف "${p.name}"؟`)
    if (!confirmed) return

    setDeletingId(p.id)
    setMessage('')

    const res = await fetch(`/api/admin/featured-players?id=${p.id}`, { method: 'DELETE' })
    const data = await res.json()

    setDeletingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء الحذف')
      return
    }

    setPlayers((prev) => prev.filter((x) => x.id !== p.id))
  }

  async function handleToggleActive(p: FeaturedPlayer) {
    setTogglingId(p.id)
    setMessage('')

    const res = await fetch('/api/admin/featured-players', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    })
    const data = await res.json()

    setTogglingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء تحديث الحالة')
      return
    }

    setPlayers((prev) => prev.map((x) => (x.id === p.id ? { ...x, isActive: !x.isActive } : x)))
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

  const avatarStyle = { width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' as const, border: '1px solid rgba(212,175,55,0.4)' }
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
            <h1 style={s.title}>إدارة اللاعبين المميزين</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>حسب الموسم الرياضي</p>
          </div>
          <Link href="/admin/add-featured-player" className="btn-primary" style={{ ...s.button, textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            ➕ إضافة لاعب مميز
          </Link>
        </div>

        {message && <p style={{ ...s.error, marginBottom: 15 }}>{message}</p>}

        {players.length === 0 ? (
          <div style={s.formCard}>
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>لا يوجد لاعبون مضافون بعد</p>
          </div>
        ) : (
          <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الصورة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الاسم</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الموسم</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الرياضة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الإنجاز</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الحالة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={avatarStyle} />
                      ) : (
                        <div style={{ ...avatarStyle, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
                          {p.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '12px', color: '#d4af37', fontWeight: 700 }}>{p.season}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{p.sport || '—'}</td>
                    <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{p.achievement || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={badge(p.isActive)}>{p.isActive ? 'نشط' : 'غير نشط'}</span>
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' as const }}>
                      <Link href={`/admin/edit-featured-player?id=${p.id}`} style={{ ...editBtn, textDecoration: 'none', display: 'inline-block' }}>
                        ✏️ تعديل
                      </Link>
                      <button onClick={() => handleToggleActive(p)} disabled={togglingId === p.id} style={toggleBtnStyle}>
                        {togglingId === p.id ? '...' : p.isActive ? '🙈 إخفاء' : '👁️ إظهار'}
                      </button>
                      <button onClick={() => handleDelete(p)} disabled={deletingId === p.id} style={deleteBtnStyle}>
                        {deletingId === p.id ? '...' : '🗑️ حذف'}
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