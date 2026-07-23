'use client'

import { useState } from 'react'
import Link from 'next/link'

const cardStyle = { maxWidth: 560, margin: '40px auto', fontFamily: "'Tajawal', sans-serif", padding: 32, background: 'rgba(30,41,59,0.7)', color: '#e2e8f0', borderRadius: 16, border: '1px solid rgba(212,175,55,0.25)' }
const inputStyle = { width: '100%', padding: '14px 16px', marginTop: 8, fontSize: 16, border: '1px solid rgba(148,163,184,0.3)', borderRadius: 10, background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', boxSizing: 'border-box' as const }
const buttonStyle = { width: '100%', padding: 16, marginTop: 16, fontSize: 17, fontWeight: 700, background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 10, cursor: 'pointer' }

interface PlayerResult { id: string; fullName: string }

export default function CoachSearchPage() {
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<PlayerResult[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const res = await fetch(`/api/coach/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setPlayers(data.players || [])
    setLoading(false)
  }

  return (
    <div style={cardStyle}>
      <h1 style={{ color: '#f8fafc' }}>البحث عن لاعب</h1>
      <p style={{ color: '#94a3b8' }}>ابحث في لاعبيك فقط</p>

      <form onSubmit={handleSearch}>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} style={inputStyle} placeholder="اكتب الاسم..." />
        <button type="submit" disabled={loading} className="btn-primary" style={buttonStyle}>
          {loading ? 'جارٍ البحث...' : 'بحث'}
        </button>
      </form>

      {players.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {players.map((p) => (
            <Link key={p.id} href={`/coach/player/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, marginBottom: 8, color: '#e2e8f0' }}>
                {p.fullName}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && query && players.length === 0 && (
        <p style={{ color: '#94a3b8', marginTop: 20 }}>لا توجد نتائج</p>
      )}
    </div>
  )
}