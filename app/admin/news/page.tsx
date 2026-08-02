'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface NewsItem {
  id: string
  title: string
  imageUrl: string | null
  isActive: boolean
  createdAt: string
}

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.news) setNews(data.news)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(n: NewsItem) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف خبر "${n.title}"؟`)
    if (!confirmed) return

    setDeletingId(n.id)
    setMessage('')

    const res = await fetch(`/api/admin/news?id=${n.id}`, { method: 'DELETE' })
    const data = await res.json()

    setDeletingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء الحذف')
      return
    }

    setNews((prev) => prev.filter((x) => x.id !== n.id))
  }

  async function handleToggleActive(n: NewsItem) {
    setTogglingId(n.id)
    setMessage('')

    const res = await fetch('/api/admin/news', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: n.id, isActive: !n.isActive }),
    })
    const data = await res.json()

    setTogglingId(null)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ أثناء تحديث الحالة')
      return
    }

    setNews((prev) => prev.map((x) => (x.id === n.id ? { ...x, isActive: !x.isActive } : x)))
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
            <h1 style={s.title}>إدارة الأخبار</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>أحدث أخبار الأكاديمية بالصفحة الرئيسية</p>
          </div>
          <Link href="/admin/add-news" className="btn-primary" style={{ ...s.button, textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            ➕ إضافة خبر جديد
          </Link>
        </div>

        {message && <p style={{ ...s.error, marginBottom: 15 }}>{message}</p>}

        {news.length === 0 ? (
          <div style={s.formCard}>
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>لا توجد أخبار مضافة بعد</p>
          </div>
        ) : (
          <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الصورة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>العنوان</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>التاريخ</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الحالة</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' as const, color: '#d4af37', fontSize: 13 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {news.map((n) => (
                  <tr key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>
                      {n.imageUrl ? (
                        <img src={n.imageUrl} alt={n.title} style={{ width: 60, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 60, height: 44, borderRadius: 6, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📰</div>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>{n.title}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={badge(n.isActive)}>{n.isActive ? 'نشط' : 'غير نشط'}</span>
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' as const }}>
                      <Link href={`/admin/edit-news?id=${n.id}`} style={{ ...editBtn, textDecoration: 'none', display: 'inline-block' }}>
                        ✏️ تعديل
                      </Link>
                      <button onClick={() => handleToggleActive(n)} disabled={togglingId === n.id} style={toggleBtnStyle}>
                        {togglingId === n.id ? '...' : n.isActive ? '🙈 إخفاء' : '👁️ إظهار'}
                      </button>
                      <button onClick={() => handleDelete(n)} disabled={deletingId === n.id} style={deleteBtnStyle}>
                        {deletingId === n.id ? '...' : '🗑️ حذف'}
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