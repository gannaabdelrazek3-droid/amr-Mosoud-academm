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
  const [savingKey, setSavingKey] = useState<string>('')
  const [markedToday, setMarkedToday] = useState<Record<string, 'present' | 'absent'>>({})
  const [message, setMessage] = useState('')

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

  async function markAttendance(playerId: string, sportId: string, present: boolean) {
    const key = `${playerId}-${sportId}`
    setSavingKey(key)
    setMessage('')

    try {
      const res = await fetch('/api/secretary/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, sportId, present }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'حدث خطأ')
        return
      }

      setMarkedToday((prev) => ({
        ...prev,
        [key]: present ? 'present' : 'absent',
      }))
    } catch {
      setMessage('حدث خطأ في الاتصال')
    } finally {
      setSavingKey('')
    }
  }

  function renderPlayerRow(p: PlayerItem, currentSportId?: string) {
    const targetSports = currentSportId
      ? p.sports.filter((s) => s.id === currentSportId)
      : p.sports

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

        {targetSports.length === 0 ? (
          <span style={{ color: '#94a3b8', fontSize: 12 }}>لا توجد رياضة</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {targetSports.map((sp) => {
              const key = `${p.id}-${sp.id}`
              const status = markedToday[key]
              const isSaving = savingKey === key

              return (
                <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {targetSports.length > 1 && (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{sp.name}:</span>
                  )}
                  <button
                    onClick={() => markAttendance(p.id, sp.id, true)}
                    disabled={isSaving || !!status}
                    style={{
                      padding: '8px 14px',
                      background: status === 'present' ? '#22c55e' : status === 'absent' ? 'rgba(148,163,184,0.1)' : '#d4af37',
                      color: status === 'present' ? '#ffffff' : status === 'absent' ? '#64748b' : '#0f172a',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontFamily: "'Tajawal', sans-serif",
                      cursor: isSaving || !!status ? 'default' : 'pointer',
                      fontSize: 12.5,
                      opacity: isSaving ? 0.6 : 1,
                    }}
                  >
                    {isSaving ? '...' : status === 'present' ? 'حضر ✓' : 'حضر'}
                  </button>

                  <button
                    onClick={() => markAttendance(p.id, sp.id, false)}
                    disabled={isSaving || !!status}
                    style={{
                      padding: '8px 14px',
                      background: status === 'absent' ? '#ef4444' : status === 'present' ? 'rgba(148,163,184,0.1)' : 'rgba(239,68,68,0.2)',
                      color: status === 'absent' ? '#ffffff' : status === 'present' ? '#64748b' : '#ef4444',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontFamily: "'Tajawal', sans-serif",
                      cursor: isSaving || !!status ? 'default' : 'pointer',
                      fontSize: 12.5,
                      opacity: isSaving ? 0.6 : 1,
                    }}
                  >
                    {isSaving ? '...' : status === 'absent' ? 'غائب ✕' : 'غائب'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 650, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>تسجيل الحضور اليومي</h1>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        {message && <p style={{ color: '#fca5a5', marginBottom: 16 }}>{message}</p>}

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
                  {sportPlayers.map((p) => renderPlayerRow(p, sport.id))}
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