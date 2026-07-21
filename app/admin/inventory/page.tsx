'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'

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

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleRestock(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const res = await fetch('/api/admin/inventory/restock', {
      method: 'POST',
      body: JSON.stringify({ productId: restockId, quantity: restockQty }),
    })

    if (!res.ok) {
      setMessage('حصلت مشكلة في التجديد')
      return
    }

    setMessage('تم تجديد الكمية بنجاح')
    setRestockId('')
    setRestockQty('')
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

    if (!res.ok) {
      setMessage(data.error || 'حصلت مشكلة في البيع')
      return
    }

    setMessage('تم تسجيل البيع بنجاح')
    setSellId('')
    setSellQty('')
    setSellPrice('')
    loadProducts()
  }

  function onSelectSellProduct(id: string) {
    setSellId(id)
    const p = products.find((x) => x.id === id)
    if (p?.defaultPrice) setSellPrice(String(p.defaultPrice))
  }

  if (loading) {
    return <div style={s.page}><p>جاري التحميل...</p></div>
  }

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0)

  return (
    <div style={s.page}>
      <h1 style={s.title}>المخزون والمبيعات</h1>
      <p style={s.subtitle}>إجمالي إيراد المنتجات: {totalRevenue} جنيه</p>

      <Link href="/admin/inventory/add-product" style={{ textDecoration: 'none' }}>
        <div style={{ ...s.button, textAlign: 'center' as const, marginBottom: 24 }}>
          + إضافة منتج جديد
        </div>
      </Link>

      {message && <p style={s.error}>{message}</p>}

      {products.length === 0 ? (
        <p style={{ color: '#999' }}>لا يوجد منتجات مسجلة بعد</p>
      ) : (
        products.map((p) => (
          <div key={p.id} style={{ background: '#f8f8f8', borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ fontSize: 17 }}>{p.name}</strong>
              <span style={{ color: p.remaining <= 3 ? '#d32f2f' : '#111', fontWeight: 700 }}>
                متبقي: {p.remaining}
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#555', margin: 0 }}>
              اتباع: {p.totalSold} | دخل منه: {p.revenue} جنيه
            </p>
          </div>
        ))
      )}

      {products.length > 0 && (
        <>
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #eee' }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>🧾 تسجيل عملية بيع</h3>
            <form onSubmit={handleSell}>
              <label style={s.label}>
                المنتج
                <select value={sellId} onChange={(e) => onSelectSellProduct(e.target.value)} style={s.input} required>
                  <option value="">-- اختار منتج --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (متبقي {p.remaining})</option>
                  ))}
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

              <button type="submit" style={s.button}>تسجيل البيع</button>
            </form>
          </div>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #eee' }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>📦 تجديد كمية</h3>
            <form onSubmit={handleRestock}>
              <label style={s.label}>
                المنتج
                <select value={restockId} onChange={(e) => setRestockId(e.target.value)} style={s.input} required>
                  <option value="">-- اختار منتج --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label style={s.label}>
                الكمية الجديدة
                <input type="number" min="1" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} style={s.input} required />
              </label>

              <button type="submit" style={s.button}>تجديد الكمية</button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}