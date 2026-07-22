'use client'

import { useState } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../../admin/adminStyles'

interface PlayerResult {
  id: string
  fullName: string
}

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
    <div style={s.page}>
      <h1 style={s.title}>البحث عن لاعب</h1>
      <p style={s.subtitle}>ابحثي في لاعبينك بس</p>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={s.input}
          placeholder="اكتبي الاسم..."
        />
        <button type="submit" disabled={loading} style={s.button}>
          {loading ? 'جاري البحث...' : 'بحث'}
        </button>
      </form>

      {players.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {players.map((p) => (
            <Link key={p.id} href={`/coach/player/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={s.checkboxLabel}>
                <span style={{ color: '#111' }}>{p.fullName}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && query && players.length === 0 && (
        <p style={{ color: '#999', marginTop: 20 }}>مفيش نتائج</p>
      )}
    </div>
  )
}