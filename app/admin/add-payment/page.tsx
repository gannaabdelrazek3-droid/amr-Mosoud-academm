'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddPaymentPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/add-payment', {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(amount),
        description,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('حصلت مشكلة، حاول تاني')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif', padding: 20, background: '#fff', color: '#000' }}>
      <h1>تسجيل دخل جديد</h1>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginTop: 16 }}>
          المبلغ (جنيه)
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4 }}
            required
          />
        </label>

        <label style={{ display: 'block', marginTop: 16 }}>
          الوصف (مثلاً: بيع تيشيرت، رسوم تسجيل)
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 4 }}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 12, marginTop: 20, background: '#111', color: '#fff', border: 'none', borderRadius: 8 }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </button>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  )
}