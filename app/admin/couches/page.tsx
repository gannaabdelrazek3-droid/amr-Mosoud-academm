'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface CoachSport {
  sport: { id: string; name: string }
}

interface Coach {
  id: string
  fullName: string
  phone: string
  title: string | null
  avatarUrl: string | null
  yearsExperience: number | null
  isActive: boolean
  createdAt: string
  coachSports: CoachSport[]
}

export default function CoachesListPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function loadCoaches() {
    setLoading(true)
    fetch('/api/admin/coaches')
      .then((res) => res.json())
      .then((data) => {
        if (data.coaches) setCoaches(data.coaches)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCoaches()
  }, [])

  async function handleDelete(coach: Coach) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف المدرب "${coach.fullName}"؟ لا يمكن التراجع عن هذا الإجراء.`)
    if (!confirmed) return

    setDeletingId(coach.id)
    setMessage('')

    const res = await fetch(`/api/admin/coaches?id=${coach.id}`, { method: 'DELETE' })
    const data = await res.json()

    setDeletingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء حذف المدرب')
      return
    }

    setCoaches((prev) => prev.filter((c) => c.id !== coach.id))
  }

  async function handleToggleActive(coach: Coach) {
    setTogglingId(coach.id)
    setMessage('')

    const res = await fetch('/api/admin/coaches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coach.id, isActive: !coach.isActive }),
    })
    const data = await res.json()

    setTogglingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء تحديث حالة المدرب')
      return
    }

    setCoaches((prev) =>
      prev.map((c) => (c.id === coach.id ? { ...c, isActive: !c.isActive } : c))
    )
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

  const avatarStyle = {
    width: 44,
    height: 44,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '1px solid rgba(212,175,55,0.4)',
  }

  const actionBtn = {
    border: 'none',
    borderRadius: 6,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 13,
    marginLeft: 6,
  }

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
            <h1 style={s.title}>إدارة المدربين</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إضافة وتعديل وحذف بيانات المدربين</p>
          </div>
          <Link href="/admin/add-coach" className="btn-primary" style={{ ...s.button, textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            ➕ إضافة مدرب جديد
          </Link>
        </div>

        {message && <p style={{ ...s.error, marginBottom: 15 }}>{message}</p>}

        {coaches.length === 0 ? (
          <div style={s.formCard}>
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>لا يوجد مدربون مضافون بعد</p>
          </div>
        ) : (
          <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الصورة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الاسم</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>التخصص</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الرياضات</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>سنوات الخبرة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الحالة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map((coach) => (
                  <tr key={coach.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>
                      {coach.avatarUrl ? (
                        <img src={coach.avatarUrl} alt={coach.fullName} style={avatarStyle} />
                      ) : (
                        <div style={{ ...avatarStyle, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
                          {coach.fullName.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>{coach.fullName}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{coach.title || '—'}</td>
                    <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>
                      {coach.coachSports.length > 0
                        ? coach.coachSports.map((cs) => cs.sport.name).join('، ')
                        : '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{coach.yearsExperience ?? '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={badge(coach.isActive)}>{coach.isActive ? 'نشط' : 'غير نشط'}</span>
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' as const }}>
                      <Link href={`/admin/edit-coach?id=${coach.id}`} style={{ ...editBtn, textDecoration: 'none', display: 'inline-block' }}>
                        ✏️ تعديل
                      </Link>
                      <button
                        onClick={() => handleToggleActive(coach)}
                        disabled={togglingId === coach.id}
                        style={toggleBtnStyle}
                      >
                        {togglingId === coach.id ? '...' : coach.isActive ? '🙈 إخفاء' : '👁️ إظهار'}
                      </button>
                      <button
                        onClick={() => handleDelete(coach)}
                        disabled={deletingId === coach.id}
                        style={deleteBtnStyle}
                      >
                        {deletingId === coach.id ? '...' : '🗑️ حذف'}
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