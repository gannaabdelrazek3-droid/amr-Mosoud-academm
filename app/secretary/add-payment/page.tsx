'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const pageStyle = {
  background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
  minHeight: '100vh',
  fontFamily: "'Tajawal', sans-serif",
  padding: '32px 20px',
}

const cardStyle = {
  maxWidth: 500,
  margin: '0 auto',
  background: 'rgba(30,41,59,0.6)',
  border: '1px solid rgba(212,175,55,0.2)',
  borderRadius: 16,
  padding: 24,
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  marginBottom: 14,
  fontSize: 15,
  fontFamily: "'Tajawal', sans-serif",
  border: '1px solid rgba(148,163,184,0.3)',
  borderRadius: 10,
  background: 'rgba(15,23,42,0.5)',
  color: '#f1f5f9',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  display: 'block',
  color: '#e2e8f0',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
}

const buttonStyle = {
  width: '100%',
  padding: 14,
  fontSize: 16,
  fontWeight: 700,
  fontFamily: "'Tajawal', sans-serif",
  background: '#d4af37',
  color: '#0f172a',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
}

export default function SecretaryAddPaymentPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/add-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء حفظ الدفعة')
      return
    }

    router.push('/secretary')
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: '#f8fafc', marginBottom: 6 }}>💵 تسجيل دخل جديد</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>سجّلي مبلغ إيراد جديد يدخل في حسابات الأكاديمية</p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>المبلغ (بالجنيه) *</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
            placeholder="مثال: 500"
            required
          />

          <label style={labelStyle}>وصف الدفعة (اختياري)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
            placeholder="مثال: دفعة نقدية من ولي أمر"
          />

          <button type="submit" disabled={saving} style={buttonStyle}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ الدفعة'}
          </button>

          {message && <p style={{ color: '#fca5a5', textAlign: 'center', marginTop: 14 }}>{message}</p>}
        </form>
      </div>
    </div>
  )
}