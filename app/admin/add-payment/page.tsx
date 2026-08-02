'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

export default function AddPaymentPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/add-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsedAmount, description }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدثت مشكلة، حاول مرة أخرى')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('حدث خطأ في الاتصال بالخادم، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>تسجيل دخل جديد</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>سجّل أي دخل يدوي خارج الاشتراكات والمبيعات</p>
          </div>
        </div>

        <div style={s.formCard}>
          <form onSubmit={handleSubmit}>
            <label style={s.label}>
              المبلغ (جنيه)
              <input 
                type="number" 
                step="0.5" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                style={s.input} 
                placeholder="0.00"
                required 
              />
            </label>

            <label style={s.label}>
              الوصف
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                style={s.input} 
                placeholder="أدخل تفاصيل الدخل اليدوي..."
              />
            </label>

            <button type="submit" disabled={loading} className="btn-primary" style={s.button}>
              {loading ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>

            {error && <p style={s.error}>{error}</p>}
          </form>
        </div>
      </div>
    </AdminShell>
  )
}