'use client'

import { useState } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface PlayerResult { id: string; fullName: string; phone: string | null }
interface CoachResult { id: string; fullName: string; phone: string }

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
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>البحث</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>ابحث باسم لاعب أو مدرب</p>
          </div>
        </div>

        <div style={s.formCard}>
          <form onSubmit={handleSearch}>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} style={s.input} placeholder="اكتب الاسم..." />
            <button type="submit" disabled={loading} className="btn-primary" style={s.button}>
              {loading ? 'جارٍ البحث...' : 'بحث'}
            </button>
          </form>

          {players.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ color: '#f8fafc', fontSize: 17 }}>لاعبون</h3>
              {players.map((p) => (
                <Link key={p.id} href={`/admin/edit-player/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={s.checkboxLabel}><span style={{ color: '#e2e8f0' }}>{p.fullName}</span></div>
                </Link>
              ))}
            </div>
          )}

          {coaches.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ color: '#f8fafc', fontSize: 17 }}>مدربون</h3>
              {coaches.map((c) => (
                <Link key={c.id} href={`/admin/edit-coach/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={s.checkboxLabel}><span style={{ color: '#e2e8f0' }}>{c.fullName}</span></div>
                </Link>
              ))}
            </div>
          )}

          {!loading && query && players.length === 0 && coaches.length === 0 && (
            <p style={{ color: '#94a3b8', marginTop: 20 }}>لا توجد نتائج</p>
          )}
        </div>
      </div>
    </AdminShell>
  )
}