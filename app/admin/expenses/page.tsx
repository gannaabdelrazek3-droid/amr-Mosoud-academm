'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface Expense {
  id: string
  title: string
  category: string | null
  amount: number
  date: string
  note: string | null
}

const categories = ['إيجار', 'كهرباء', 'مياه', 'صيانة', 'رواتب', 'أخرى']

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadExpenses = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/expenses')
      .then((res) => res.json())
      .then((data) => setExpenses(data.expenses || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadExpenses() }, [loadExpenses])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !amount) return
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, amount, date, note }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setMessage(data.error || 'حدث خطأ'); return }

    setTitle(''); setCategory(''); setAmount(''); setDate(''); setNote('')
    loadExpenses()
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا المصروف؟')) return
    await fetch(`/api/admin/expenses?id=${id}`, { method: 'DELETE' })
    loadExpenses()
  }

  const totalThisMonth = expenses
    .filter((e) => new Date(e.date).getMonth() === new Date().getMonth() && new Date(e.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, e) => sum + Number(e.amount), 0)

  if (loading) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>المصروفات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إجمالي مصروفات الشهر الحالي: {totalThisMonth.toFixed(2)} جنيه</p>
          </div>
        </div>

        {message && <p style={s.error}>{message}</p>}

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={{ color: '#d4af37', marginTop: 0 }}>➕ إضافة مصروف</h3>
          <form onSubmit={handleAdd}>
            <label style={s.label}>البند<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={s.input} placeholder="مثال: إيجار الصالة" required /></label>
            <label style={s.label}>
              التصنيف
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.input}>
                <option value="">بدون تصنيف</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={s.label}>المبلغ (جنيه)<input type="number" step="0.5" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={s.input} required /></label>
            <label style={s.label}>التاريخ (اختياري، الافتراضي اليوم)<input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={s.input} /></label>
            <label style={s.label}>ملاحظة (اختياري)<input type="text" value={note} onChange={(e) => setNote(e.target.value)} style={s.input} /></label>
            <button type="submit" disabled={saving} className="btn-primary" style={s.button}>{saving ? 'جارٍ الحفظ...' : 'حفظ المصروف'}</button>
          </form>
        </div>

        <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>البند</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>التصنيف</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>المبلغ</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>التاريخ</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#e2e8f0' }}>{e.title}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{e.category || '—'}</td>
                  <td style={{ padding: 12, color: '#ef4444', fontWeight: 700 }}>{Number(e.amount).toFixed(2)} جنيه</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{new Date(e.date).toLocaleDateString('ar-EG')}</td>
                  <td style={{ padding: 12 }}><button onClick={() => handleDelete(e.id)} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}