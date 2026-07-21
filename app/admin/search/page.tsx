'use client'

import { useState } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'

interface PlayerResult {
  id: string
  fullName: string
  phone: string | null
}

interface CoachResult {
  id: string
  fullName: string
  phone: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<PlayerResult[]>([])
  const [coaches, setCoaches] = useState<CoachResult[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setPlayers(data.players || [])
    setCoaches(data.coaches || [])
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>البحث</h1>
      <p style={s.subtitle}>ابحثي باسم لاعب أو مدرب</p>

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
          <h3 style={{ fontSize: 17 }}>لاعبين</h3>
          {players.map((p) => (
            <Link key={p.id} href={`/admin/edit-player/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={s.checkboxLabel}>
                <span style={{ color: '#111' }}>{p.fullName}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {coaches.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 17 }}>مدربين</h3>
          {coaches.map((c) => (
            <Link key={c.id} href={`/admin/edit-coach/${c.id}`} style={{ textDecoration: 'none' }}>
              <div style={s.checkboxLabel}>
                <span style={{ color: '#111' }}>{c.fullName}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && query && players.length === 0 && coaches.length === 0 && (
        <p style={{ color: '#999', marginTop: 20 }}>مفيش نتائج</p>
      )}
    </div>
  )
}