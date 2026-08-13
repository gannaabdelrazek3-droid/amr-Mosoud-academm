'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface ProductRow {
  id: string
  name: string
  defaultPrice: number | null
  remaining: number
  totalPurchased: number
  totalSold: number
  revenue: number
}

interface UnsettledSale {
  id: string
  productName: string
  buyerName: string | null
  quantity: number
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  date: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [unsettled, setUnsettled] = useState<UnsettledSale[]>([])
  const [loading, setLoading] = useState(true)

  const [restockId, setRestockId] = useState('')
  const [restockQty, setRestockQty] = useState('')

  const [sellId, setSellId] = useState('')
  const [sellQty, setSellQty] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [paidAmount, setPaidAmount] = useState('')

  const [message, setMessage] = useState('')

  const totalSellAmount = Number(sellQty || 0) * Number(sellPrice || 0)
  const sellRemaining = Math.max(0, totalSellAmount - Number(paidAmount || 0))

  const loadAll = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/inventory').then((r) => r.json()),
      fetch('/api/admin/inventory/sales').then((r) => r.json()),
    ]).then(([prodData, salesData]) => {
      setProducts(prodData.products || [])
      setUnsettled(salesData.sales || [])
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function handleRestock(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    const res = await fetch('/api/admin/inventory/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: restockId, quantity: restockQty }),
    })
    if (!res.ok) { setMessage('حدثت مشكلة في التجديد'); return }
    setMessage('تم تجديد الكمية بنجاح')
    setRestockId('')
    setRestockQty('')
    loadAll()
  }

  async function handleSell(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    const res = await fetch('/api/admin/inventory/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: sellId, quantity: sellQty, pricePerUnit: sellPrice, buyerName, paidAmount }),
    })
    const data = await res.json()
    if (!res.ok) { setMessage(data.error || 'حدثت مشكلة في البيع'); return }

    setMessage(data.paymentStatus === 'PAID' ? '✅ تم تسجيل البيع مدفوعًا بالكامل' : `💰 تم تسجيل البيع - متبقي على المشتري: ${data.remainingAmount.toFixed(2)} جنيه`)
    setSellId('')
    setSellQty('')
    setSellPrice('')
    setBuyerName('')
    setPaidAmount('')
    loadAll()
  }

  async function handleSettle(saleId: string) {
    await fetch('/api/admin/inventory/settle-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saleId }),
    })
    loadAll()
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    const res = await fetch(`/api/admin/inventory?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { setMessage(data.error || 'حدث خطأ أثناء الحذف'); return }
    loadAll()
  }

  function onSelectSellProduct(id: string) {
    setSellId(id)
    const p = products.find((x) => x.id === id)
    if (p?.defaultPrice) setSellPrice(String(p.defaultPrice))
  }

  if (loading) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0)

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>المخزون والمبيعات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إجمالي الإيراد المحصّل فعليًا: {totalRevenue.toFixed(2)} جنيه</p>
          </div>
          <Link href="/admin/inventory/add-product" className="btn-primary" style={{ ...s.button, width: 'auto', margin: 0, padding: '12px 22px', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
            + إضافة منتج جديد
          </Link>
        </div>

        {message && <p style={s.error}>{message}</p>}

        {products.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا توجد منتجات مسجّلة بعد</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            {products.map((p) => (
              <div key={p.id} style={{ ...s.statCard, minWidth: 220, flex: '1 1 220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong style={{ color: '#f8fafc' }}>{p.name}</strong>
                  <span style={{ color: p.remaining <= 3 ? '#fca5a5' : '#d4af37', fontWeight: 700 }}>متبقٍ: {p.remaining}</span>
                </div>
                <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 10px' }}>المُباع: {p.totalSold} | الدخل: {p.revenue.toFixed(2)} جنيه</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/admin/inventory/edit-product/${p.id}`} style={{ flex: 1, textAlign: 'center' as const, padding: '6px 10px', background: 'rgba(212,175,55,0.15)', color: '#d4af37', borderRadius: 6, textDecoration: 'none', fontSize: 12.5, fontWeight: 700 }}>✏️ تعديل</Link>
                  <button onClick={() => handleDeleteProduct(p.id)} style={{ flex: 1, padding: '6px 10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>🗑️ حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {unsettled.length > 0 && (
          <div style={{ ...s.formCard, marginBottom: 24 }}>
            <h3 style={{ color: '#d4af37', marginTop: 0 }}>⏳ مبيعات عليها مبلغ متبقي</h3>
            {unsettled.map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.5)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, flexWrap: 'wrap' as const, gap: 8 }}>
                <span style={{ color: '#e2e8f0', fontSize: 13.5 }}>
                  {u.productName} × {u.quantity} — {u.buyerName || 'بدون اسم'} — دفع {u.paidAmount.toFixed(2)} من {u.totalAmount.toFixed(2)} — متبقي <strong style={{ color: '#d4af37' }}>{u.remainingAmount.toFixed(2)}</strong> جنيه
                </span>
                <button onClick={() => handleSettle(u.id)} style={{ padding: '6px 16px', background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}>تحصيل المتبقي</button>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ ...s.formCard, flex: 1, minWidth: 300 }}>
              <h3 style={{ color: '#f8fafc', marginTop: 0 }}>🧾 تسجيل عملية بيع</h3>
              <form onSubmit={handleSell}>
                <label style={s.label}>
                  المنتج
                  <select value={sellId} onChange={(e) => onSelectSellProduct(e.target.value)} style={s.input} required>
                    <option value="">-- اختر منتجًا --</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} (متبقٍ {p.remaining})</option>)}
                  </select>
                </label>
                <label style={s.label}>
                  الكمية المباعة
                  <input type="number" min="1" value={sellQty} onChange={(e) => setSellQty(e.target.value)} style={s.input} required />
                </label>
                <label style={s.label}>
                  سعر الوحدة (جنيه)
                  <input type="number" step="0.5" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} style={s.input} required />
                </label>
                <label style={s.label}>
                  اسم المشتري (اختياري)
                  <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} style={s.input} placeholder="مثال: اسم اللاعب أو ولي الأمر" />
                </label>
                <label style={s.label}>
                  المبلغ المدفوع الآن (جنيه)
                  <input type="number" step="0.5" min="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} style={s.input} required />
                </label>

                {sellQty && sellPrice && paidAmount && (
                  <div style={{ margin: '4px 0 14px', padding: '10px 14px', background: sellRemaining > 0 ? 'rgba(212,175,55,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${sellRemaining > 0 ? 'rgba(212,175,55,0.35)' : 'rgba(34,197,94,0.35)'}`, borderRadius: 8 }}>
                    <span style={{ color: sellRemaining > 0 ? '#d4af37' : '#22c55e', fontWeight: 700, fontSize: 13 }}>
                      الإجمالي: {totalSellAmount.toFixed(2)} جنيه {sellRemaining > 0 ? `— سيبقى متبقي: ${sellRemaining.toFixed(2)} جنيه` : '— مدفوع بالكامل ✅'}
                    </span>
                  </div>
                )}

                <button type="submit" className="btn-primary" style={s.button}>تسجيل البيع</button>
              </form>
            </div>

            <div style={{ ...s.formCard, flex: 1, minWidth: 300 }}>
              <h3 style={{ color: '#f8fafc', marginTop: 0 }}>📦 تجديد كمية</h3>
              <form onSubmit={handleRestock}>
                <label style={s.label}>
                  المنتج
                  <select value={restockId} onChange={(e) => setRestockId(e.target.value)} style={s.input} required>
                    <option value="">-- اختر منتجًا --</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
                <label style={s.label}>
                  الكمية الجديدة
                  <input type="number" min="1" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} style={s.input} required />
                </label>
                <button type="submit" className="btn-primary" style={s.button}>تجديد الكمية</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}