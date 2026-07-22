'use client'

import { useState, useEffect } from 'react'
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

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)

  const [restockId, setRestockId] = useState('')
  const [restockQty, setRestockQty] = useState('')

  const [sellId, setSellId] = useState('')
  const [sellQty, setSellQty] = useState('')
  const [sellPrice, setSellPrice] = useState('')

  const [message, setMessage] = useState('')

  function loadProducts() {
    setLoading(true)
    fetch('/api/admin/inventory')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  async function handleRestock(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    const res = await fetch('/api/admin/inventory/restock', {
      method: 'POST',
      body: JSON.stringify({ productId: restockId, quantity: restockQty }),
    })
    if (!res.ok) { setMessage('حدثت مشكلة في التجديد'); return }
    setMessage('تم تجديد الكمية بنجاح')
    setRestockId(''); setRestockQty('')
    loadProducts()
  }

  async function handleSell(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    const res = await fetch('/api/admin/inventory/sell', {
      method: 'POST',
      body: JSON.stringify({ productId: sellId, quantity: sellQty, pricePerUnit: sellPrice }),
    })
    const data = await res.json()
    if (!res.ok) { setMessage(data.error || 'حدثت مشكلة في البيع'); return }
    setMessage('تم تسجيل البيع بنجاح')
    setSellId(''); setSellQty(''); setSellPrice('')
    loadProducts()
  }

  function onSelectSellProduct(id: string) {
    setSellId(id)
    const p = products.find((x) => x.id === id)
    if (p?.defaultPrice) setSellPrice(String(p.defaultPrice))
  }

  if (loading) {
    return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>
  }

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0)

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>المخزون والمبيعات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إجمالي إيراد المنتجات: {totalRevenue} جنيه</p>
          </div>
          <Link href="/admin/inventory/add-product" className="btn-primary" style={{ ...s.button, width: 'auto', margin: 0, padding: '12px 22px' }}>
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
                  <span style={{ color: p.remaining <= 3 ? '#fca5a5' : '#d4af37', fontWeight: 700 }}>
                    متبقٍ: {p.remaining}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
                  المُباع: {p.totalSold} | الدخل: {p.revenue} جنيه
                </p>
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