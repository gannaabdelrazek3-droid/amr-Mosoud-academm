'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Coach = { id: string; fullName: string }

export default function ApproveButton({ requestId, coaches }: { requestId: string; coaches: Coach[] }) {
  const [loading, setLoading] = useState(false)
  const [coachId, setCoachId] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    if (!coachId) {
      alert('من فضلك اختر المدرب المسؤول عن اللاعب أولًا')
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin/registration-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action: 'approve', coachId }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setDone(true)
    } else {
      alert(data.error || 'حدثت مشكلة، حاول مرة أخرى')
    }
  }

  async function handleReject() {
    setLoading(true)
    const res = await fetch('/api/admin/registration-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action: 'reject' }),
    })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      alert('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  if (done) {
    return (
      <div
        style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: 10,
          padding: 14,
        }}
      >
        <p style={{ color: '#22c55e', fontWeight: 700, margin: '0 0 8px' }}>✓ تم قبول اللاعب وإنشاء حسابه بنجاح</p>
        <button
          onClick={() => router.refresh()}
          style={{
            padding: '8px 18px',
            background: '#d4af37',
            color: '#0f172a',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontFamily: "'Tajawal', sans-serif",
            cursor: 'pointer',
          }}
        >
          تم
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <select
        value={coachId}
        onChange={(e) => setCoachId(e.target.value)}
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid rgba(212, 175, 55, 0.3)',
          background: 'rgba(15, 23, 42, 0.6)',
          color: '#f1f5f9',
          fontFamily: "'Tajawal', sans-serif",
          fontSize: 14,
        }}
      >
        <option value="">اختر المدرب المسؤول</option>
        {coaches.map((c) => (
          <option key={c.id} value={c.id}>{c.fullName}</option>
        ))}
      </select>

      <button
        onClick={handleApprove}
        disabled={loading}
        style={{
          padding: '10px 22px',
          background: '#22c55e',
          color: '#0f172a',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontFamily: "'Tajawal', sans-serif",
          cursor: 'pointer',
        }}
      >
        {loading ? '...' : '✓ قبول وإنشاء حساب'}
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        style={{
          padding: '10px 22px',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#fca5a5',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 8,
          fontWeight: 700,
          fontFamily: "'Tajawal', sans-serif",
          cursor: 'pointer',
        }}
      >
        {loading ? '...' : '✕ رفض'}
      </button>
    </div>
  )
}