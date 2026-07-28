'use client'

import { useState, useEffect } from 'react'

interface Sport {
  id: string
  name: string
}

interface PlayerItem {
  id: string
  fullName: string
  sports: Sport[]
  markedToday: boolean
}

export default function SecretaryAttendancePage() {
  const [players, setPlayers] = useState<PlayerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)

  function loadPlayers() {
    fetch('/api/secretary/attendance')
      .then((res) => res.json())
      .then((data) => setPlayers(data.players || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPlayers()
  }, [])

  async function markPresent(playerId: string, sportId: string) {
    setMarkingId(playerId)
    await fetch('/api/secretary/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId }),
    })
    setMarkingId(null)
    loadPlayers()
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>تسجيل الحضور اليومي</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : players.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا يوجد لاعبون مسجّلون</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {players.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(30,41,59,0.6)',
                  border: p.markedToday ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 14,
                  padding: '16px 18px',
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: 16 }}>{p.fullName}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12.5, margin: '4px 0 0' }}>
                    {p.sports.map((s) => s.name).join('، ') || 'لا توجد رياضة'}
                  </p>
                </div>

                {p.markedToday ? (
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>✓ تم التسجيل</span>
                ) : p.sports.length === 1 ? (
                  <button
                    onClick={() => markPresent(p.id, p.sports[0].id)}
                    disabled={markingId === p.id}
                    style={{
                      padding: '10px 20px',
                      background: '#d4af37',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontFamily: "'Tajawal', sans-serif",
                      cursor: 'pointer',
                    }}
                  >
                    {markingId === p.id ? '...' : 'حضر ✓'}
                  </button>
                ) : p.sports.length > 1 ? (
                  <select
                    onChange={(e) => e.target.value && markPresent(p.id, e.target.value)}
                    defaultValue=""
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(212,175,55,0.3)',
                      background: 'rgba(15,23,42,0.6)',
                      color: '#f1f5f9',
                      fontFamily: "'Tajawal', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    <option value="">حضر في...</option>
                    {p.sports.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: 12.5 }}>لا توجد رياضة</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}