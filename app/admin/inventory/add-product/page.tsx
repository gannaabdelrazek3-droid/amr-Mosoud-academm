'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../../adminStyles'

export default function AddProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/inventory/add-product', {
      method: 'POST',
      body: JSON.stringify({ name, quantity, price }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'حصلت مشكلة، حاول تاني')
      return
    }

    router.push('/admin/inventory')
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>إضافة منتج جديد</h1>
      <p style={s.subtitle}>سجّلي منتج جديد بالكمية والسعر</p>

      <form onSubmit={handleSubmit}>
        <label style={s.label}>
          اسم المنتج
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={s.input} required />
        </label>

        <label style={s.label}>
          الكمية المتاحة
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={s.input} required />
        </label>

        <label style={s.label}>
          سعر الوحدة (جنيه) - اختياري
          <input type="number" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} style={s.input} />
        </label>

        <button type="submit" disabled={loading} style={s.button}>
          {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
        </button>

        {error && <p style={s.error}>{error}</p>}
      </form>
    </div>
  )
}