'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface Withdrawal {
  id: string
  amount: number
  withdrawnBy: string
  reason: string | null
  date: string
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [withdrawnBy, setWithdrawnBy] = useState('')
  const [reason, setReason] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadWithdrawals = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/withdrawals')
      .then((res) => res.json())
      .then((data) => setWithdrawals(data.withdrawals || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadWithdrawals() }, [loadWithdrawals])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !withdrawnBy) return
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, withdrawnBy, reason, date }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setMessage(data.error || 'حدث خطأ'); return }

    setAmount(''); setWithdrawnBy(''); setReason(''); setDate('')
    loadWithdrawals()
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا السحب؟')) return
    await fetch(`/api/admin/withdrawals?id=${id}`, { method: 'DELETE' })
    loadWithdrawals()
  }

  const totalThisMonth = withdrawals
    .filter((w) => new Date(w.date).getMonth() === new Date().getMonth() && new Date(w.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, w) => sum + Number(w.amount), 0)

  if (loading) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>المسحوبات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إجمالي مسحوبات الشهر الحالي: {totalThisMonth.toFixed(2)} جنيه</p>
          </div>
        </div>

        {message && <p style={s.error}>{message}</p>}

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={{ color: '#d4af37', marginTop: 0 }}>➕ تسجيل سحب</h3>
          <form onSubmit={handleAdd}>
            <label style={s.label}>المبلغ المسحوب (جنيه)<input type="number" step="0.5" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={s.input} required /></label>
            <label style={s.label}>اسم من قام بالسحب<input type="text" value={withdrawnBy} onChange={(e) => setWithdrawnBy(e.target.value)} style={s.input} placeholder="مثال: السكرتيرة سارة" required /></label>
            <label style={s.label}>السبب (اختياري)<input type="text" value={reason} onChange={(e) => setReason(e.target.value)} style={s.input} /></label>
            <label style={s.label}>التاريخ (اختياري، الافتراضي اليوم)<input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={s.input} /></label>
            <button type="submit" disabled={saving} className="btn-primary" style={s.button}>{saving ? 'جارٍ الحفظ...' : 'تسجيل السحب'}</button>
          </form>
        </div>

        <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>المبلغ</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>سحبه</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>السبب</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>التاريخ</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}></th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#ef4444', fontWeight: 700 }}>{Number(w.amount).toFixed(2)} جنيه</td>
                  <td style={{ padding: 12, color: '#e2e8f0' }}>{w.withdrawnBy}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{w.reason || '—'}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{new Date(w.date).toLocaleDateString('ar-EG')}</td>
                  <td style={{ padding: 12 }}><button onClick={() => handleDelete(w.id)} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}