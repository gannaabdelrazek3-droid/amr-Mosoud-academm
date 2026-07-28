'use client'

import { useState, useEffect } from 'react'

interface Sport {
  id: string
  name: string
}

interface Coach {
  id: string
  fullName: string
}

interface PlayerItem {
  id: string
  fullName: string
  sports: Sport[]
  coachName: string
  markedToday: boolean
}

type GroupBy = 'sport' | 'coach'

export default function SecretaryAttendancePage() {
  const [players, setPlayers] = useState<PlayerItem[]>([])
  const [allSports, setAllSports] = useState<Sport[]>([])
  const [allCoaches, setAllCoaches] = useState<Coach[]>([])
  const [groupBy, setGroupBy] = useState<GroupBy>('sport')
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)

  function loadPlayers() {
    fetch('/api/secretary/attendance')
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players || [])
        setAllSports(data.allSports || [])
        setAllCoaches(data.allCoaches || [])
      })
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

  function renderPlayerRow(p: PlayerItem) {
    return (
      <div
        key={p.id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(30,41,59,0.6)',
          border: p.markedToday ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(212,175,55,0.2)',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 8,
        }}
      >
        <div>
          <p style={{ fontWeight: 700, margin: 0, fontSize: 15 }}>{p.fullName}</p>
          <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>
            {p.coachName} — {p.sports.map((s) => s.name).join('، ') || 'لا توجد رياضة'}
          </p>
        </div>

        {p.markedToday ? (
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>✓ تم</span>
        ) : p.sports.length === 1 ? (
          <button
            onClick={() => markPresent(p.id, p.sports[0].id)}
            disabled={markingId === p.id}
            style={{
              padding: '9px 18px',
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
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid rgba(212,175,55,0.3)',
              background: 'rgba(15,23,42,0.6)',
              color: '#f1f5f9',
              fontFamily: "'Tajawal', sans-serif",
              fontSize: 12.5,
            }}
          >
            <option value="">حضر في...</option>
            {p.sports.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: 12 }}>لا توجد رياضة</span>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 650, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>تسجيل الحضور اليومي</h1>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setGroupBy('sport')}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontFamily: "'Tajawal', sans-serif",
              fontSize: 13,
              cursor: 'pointer',
              background: groupBy === 'sport' ? '#d4af37' : 'rgba(148,163,184,0.15)',
              color: groupBy === 'sport' ? '#0f172a' : '#e2e8f0',
            }}
          >
            🏅 تجميع حسب الرياضة
          </button>
          <button
            onClick={() => setGroupBy('coach')}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontFamily: "'Tajawal', sans-serif",
              fontSize: 13,
              cursor: 'pointer',
              background: groupBy === 'coach' ? '#d4af37' : 'rgba(148,163,184,0.15)',
              color: groupBy === 'coach' ? '#0f172a' : '#e2e8f0',
            }}
          >
            🏋️ تجميع حسب المدرب
          </button>
        </div>

        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : players.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا يوجد لاعبون مسجّلون</p>
        ) : groupBy === 'sport' ? (
          <>
            {allSports.map((sport) => {
              const sportPlayers = players.filter((p) => p.sports.some((s) => s.id === sport.id))
              if (sportPlayers.length === 0) return null
              return (
                <div key={sport.id} style={{ marginBottom: 26 }}>
                  <h3 style={{ color: '#d4af37', fontSize: 15, fontWeight: 900, marginBottom: 10 }}>
                    🏅 {sport.name} ({sportPlayers.length})
                  </h3>
                  {sportPlayers.map((p) => renderPlayerRow(p))}
                </div>
              )
            })}
            {(() => {
              const noSportPlayers = players.filter((p) => p.sports.length === 0)
              if (noSportPlayers.length === 0) return null
              return (
                <div style={{ marginBottom: 26 }}>
                  <h3 style={{ color: '#94a3b8', fontSize: 15, fontWeight: 900, marginBottom: 10 }}>بدون رياضة محددة</h3>
                  {noSportPlayers.map((p) => renderPlayerRow(p))}
                </div>
              )
            })()}
          </>
        ) : (
          <>
            {allCoaches.map((coach) => {
              const coachPlayers = players.filter((p) => p.coachName === coach.fullName)
              if (coachPlayers.length === 0) return null
              return (
                <div key={coach.id} style={{ marginBottom: 26 }}>
                  <h3 style={{ color: '#d4af37', fontSize: 15, fontWeight: 900, marginBottom: 10 }}>
                    🏋️ {coach.fullName} ({coachPlayers.length})
                  </h3>
                  {coachPlayers.map((p) => renderPlayerRow(p))}
                </div>
              )
            })}
            {(() => {
              const noCoachPlayers = players.filter((p) => p.coachName === 'بدون مدرب')
              if (noCoachPlayers.length === 0) return null
              return (
                <div style={{ marginBottom: 26 }}>
                  <h3 style={{ color: '#94a3b8', fontSize: 15, fontWeight: 900, marginBottom: 10 }}>بدون مدرب</h3>
                  {noCoachPlayers.map((p) => renderPlayerRow(p))}
                </div>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}