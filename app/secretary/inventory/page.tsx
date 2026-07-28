'use client'

import { useState, useEffect } from 'react'

interface ProductItem {
  id: string
  name: string
  price: number | null
  remaining: number
  totalSold: number
}

export default function SecretaryInventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  function loadProducts() {
    fetch('/api/secretary/inventory')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleSell(productId: string) {
    const qty = quantities[productId]
    if (!qty || Number(qty) <= 0) return
    setSaving(productId)
    const res = await fetch('/api/secretary/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: qty }),
    })
    setSaving(null)
    if (res.ok) {
      setQuantities((prev) => ({ ...prev, [productId]: '' }))
      loadProducts()
    } else {
      const data = await res.json()
      alert(data.error || 'حدثت مشكلة')
    }
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>المخزون والمبيعات</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>سجّلي عملية بيع منتج جديدة</p>

        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : products.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا توجد منتجات مسجّلة</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  background: 'rgba(30,41,59,0.6)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 14,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: 16 }}>{p.name}</p>
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>
                      {p.price !== null && `السعر: ${p.price} جنيه — `}
                      المتاح: {p.remaining} قطعة — تم بيع: {p.totalSold}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    min={1}
                    max={p.remaining}
                    placeholder="الكمية"
                    value={quantities[p.id] || ''}
                    onChange={(e) => setQuantities((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    style={{
                      width: 100,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(148,163,184,0.3)',
                      background: 'rgba(15,23,42,0.5)',
                      color: '#f1f5f9',
                      fontFamily: "'Tajawal', sans-serif",
                    }}
                  />
                  <button
                    onClick={() => handleSell(p.id)}
                    disabled={saving === p.id || p.remaining === 0}
                    style={{
                      padding: '10px 22px',
                      background: p.remaining === 0 ? 'rgba(148,163,184,0.2)' : '#d4af37',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontFamily: "'Tajawal', sans-serif",
                      cursor: p.remaining === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving === p.id ? '...' : 'تسجيل بيع'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}