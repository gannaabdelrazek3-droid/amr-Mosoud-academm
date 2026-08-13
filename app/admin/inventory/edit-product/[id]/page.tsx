'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminStyles as s } from '../../../adminStyles'
import AdminShell from '../../../AdminShell'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then((res) => res.json())
      .then((data) => {
        const p = (data.products || []).find((x: { id: string }) => x.id === id)
        if (p) {
          setName(p.name)
          setPrice(p.defaultPrice ? String(p.defaultPrice) : '')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, defaultPrice: price }),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'حدثت مشكلة')
      return
    }
    router.push('/admin/inventory')
  }

  if (loading) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>تعديل المنتج</h1>
          </div>
        </div>
        <div style={s.formCard}>
          <form onSubmit={handleSubmit}>
            <label style={s.label}>
              اسم المنتج
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              سعر الوحدة (جنيه)
              <input type="number" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} style={s.input} />
            </label>
            <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
              {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>
            {error && <p style={s.error}>{error}</p>}
          </form>
        </div>
      </div>
    </AdminShell>
  )
}