'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

function EditNutritionProgramContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programId = searchParams.get('id') || ''

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!programId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    fetch(`/api/admin/edit-nutrition-program?id=${programId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.program) {
          setNotFound(true)
          return
        }
        const p = data.program
        setTitle(p.title || '')
        setContent(p.content || '')
        setDisplayOrder(p.displayOrder?.toString() || '0')
        setIsActive(p.isActive ?? true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [programId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/edit-nutrition-program', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: programId,
        title,
        content,
        isActive,
        displayOrder: Number(displayOrder || 0),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء تعديل البرنامج')
      return
    }

    router.push('/admin/nutrition-programs')
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

  if (notFound) {
    return (
      <AdminShell fullName="">
        <div style={s.page}>
          <p style={s.error}>البرنامج غير موجود</p>
        </div>
      </AdminShell>
    )
  }

  const sectionTitle = {
    color: '#d4af37',
    fontSize: 17,
    fontWeight: 900,
    margin: '0 0 16px',
    paddingBottom: 10,
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>تعديل البرنامج الغذائي</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>{title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🥗 بيانات البرنامج</h3>
            <label style={s.label}>
              عنوان البرنامج *
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              محتوى البرنامج الغذائي *
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ ...s.input, minHeight: 220, resize: 'vertical' as const }}
                required
              />
            </label>
            <label style={s.label}>
              ترتيب الظهور (الأقل يظهر أولاً)
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} style={s.input} />
            </label>
            <label style={{ ...s.checkboxLabel, marginTop: 10 }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={s.checkbox} />
              نشط (يظهر في الصفحة العامة)
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </button>

          {message && <p style={{ ...s.error, marginTop: 15 }}>{message}</p>}
        </form>
      </div>
    </AdminShell>
  )
}

export default function EditNutritionProgramPage() {
  return (
    <Suspense fallback={<p style={{ color: '#e2e8f0', padding: 40 }}>جارٍ التحميل...</p>}>
      <EditNutritionProgramContent />
    </Suspense>
  )
}