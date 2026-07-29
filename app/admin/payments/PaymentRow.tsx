'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const sourceLabels: Record<string, string> = {
  SUBSCRIPTION: 'اشتراك',
  MANUAL: 'يدوي',
  PRODUCT_SALE: 'بيع منتج',
}

export default function PaymentRow({
  id,
  amount,
  description,
  date,
  source,
  playerName,
  status,
}: {
  id: string
  amount: number
  description: string | null
  date: string
  source: string
  playerName: string | null
  status: string
}) {
  const [editing, setEditing] = useState(false)
  const [newAmount, setNewAmount] = useState(String(amount))
  const [newDescription, setNewDescription] = useState(description || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/manage-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id, amount: newAmount, description: newDescription }),
    })
    setSaving(false)
    if (res.ok) {
      setEditing(false)
      router.refresh()
    } else {
      alert('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  async function handleDelete() {
    if (!confirm('هل أنت متأكد من إلغاء هذه الدفعة؟')) return
    const res = await fetch('/api/admin/manage-payment', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      alert('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  const rowStyle = {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: 10,
    padding: '14px 18px',
  }

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(148, 163, 184, 0.3)',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f1f5f9',
    fontFamily: "'Tajawal', sans-serif",
    fontSize: 13,
  }

  const smallBtn = {
    padding: '7px 14px',
    borderRadius: 7,
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
    fontSize: 12.5,
    cursor: 'pointer',
    border: 'none',
  }

  if (editing) {
    return (
      <div style={rowStyle}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} style={{ ...inputStyle, width: 120 }} />
          <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="الوصف" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={saving} style={{ ...smallBtn, background: '#22c55e', color: '#0f172a' }}>
            {saving ? '...' : 'حفظ'}
          </button>
          <button onClick={() => setEditing(false)} style={{ ...smallBtn, background: 'rgba(148,163,184,0.15)', color: '#e2e8f0' }}>
            إلغاء
          </button>
        </div>
      </div>
    )
  }

  const isCancelled = status === 'CANCELLED'

  return (
    <div style={{ ...rowStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, opacity: isCancelled ? 0.5 : 1 }}>
      <div>
        <p style={{ color: '#d4af37', fontWeight: 900, fontSize: 16, margin: '0 0 4px' }}>
          {amount} جنيه {isCancelled && <span style={{ color: '#fca5a5', fontSize: 12, fontWeight: 700 }}> (ملغية)</span>}
        </p>
        <p style={{ color: '#e2e8f0', fontSize: 13, margin: 0 }}>
          {sourceLabels[source] || source} {playerName && `— ${playerName}`} {description && `— ${description}`}
        </p>
        <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>{new Date(date).toLocaleDateString('ar-EG')}</p>
      </div>
      {!isCancelled && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditing(true)} style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>
            تعديل
          </button>
          <button onClick={handleDelete} style={{ ...smallBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
            إلغاء
          </button>
        </div>
      )}
    </div>
  )
}