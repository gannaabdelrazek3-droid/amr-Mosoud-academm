'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

const categoryLabels: Record<string, string> = {
  TOURNAMENTS: 'بطولات',
  TRAINING: 'تدريبات',
  BELT_TESTS: 'اختبارات أحزمة',
  CAMPS: 'معسكرات',
  PARTIES: 'حفلات',
}

interface Album {
  id: string
  title: string
  category: string
  coverUrl: string | null
  isActive: boolean
  items: { id: string }[]
}

export default function AlbumsListPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/albums')
      .then((res) => res.json())
      .then((data) => {
        if (data.albums) setAlbums(data.albums)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(a: Album) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف ألبوم "${a.title}"؟`)
    if (!confirmed) return

    setDeletingId(a.id)
    setMessage('')

    const res = await fetch(`/api/admin/albums?id=${a.id}`, { method: 'DELETE' })
    const data = await res.json()

    setDeletingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء حذف الألبوم')
      return
    }

    setAlbums((prev) => prev.filter((x) => x.id !== a.id))
  }

  async function handleToggleActive(a: Album) {
    setTogglingId(a.id)
    setMessage('')

    const res = await fetch('/api/admin/albums', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, isActive: !a.isActive }),
    })
    const data = await res.json()

    setTogglingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء تحديث الحالة')
      return
    }

    setAlbums((prev) => prev.map((x) => (x.id === a.id ? { ...x, isActive: !x.isActive } : x)))
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
            <h1 style={s.title}>إدارة معرض الصور والفيديوهات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إضافة وتعديل وحذف الألبومات حسب الأقسام</p>
          </div>
          <Link href="/admin/add-album" className="btn-primary" style={{ ...s.button, textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            ➕ إضافة ألبوم جديد
          </Link>
        </div>

        {message && <p style={{ ...s.error, marginBottom: 15 }}>{message}</p>}

        {albums.length === 0 ? (
          <div style={s.formCard}>
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>لا توجد ألبومات مضافة بعد</p>
          </div>
        ) : (
          <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الغلاف</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>العنوان</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>القسم</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>عدد الملفات</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الحالة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>
                      {a.coverUrl ? (
                        <img src={a.coverUrl} alt={a.title} style={{ width: 60, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 60, height: 44, borderRadius: 6, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>{a.title}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{categoryLabels[a.category] || a.category}</td>
                    <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{a.items.length} ملف</td>
                    <td style={{ padding: '12px' }}>
                      <span style={badge(a.isActive)}>{a.isActive ? 'نشط' : 'غير نشط'}</span>
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' as const }}>
                      <Link href={`/admin/edit-album?id=${a.id}`} style={{ ...editBtn, textDecoration: 'none', display: 'inline-block' }}>
                        ✏️ تعديل
                      </Link>
                      <button onClick={() => handleToggleActive(a)} disabled={togglingId === a.id} style={toggleBtnStyle}>
                        {togglingId === a.id ? '...' : a.isActive ? '🙈 إخفاء' : '👁️ إظهار'}
                      </button>
                      <button onClick={() => handleDelete(a)} disabled={deletingId === a.id} style={deleteBtnStyle}>
                        {deletingId === a.id ? '...' : '🗑️ حذف'}
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