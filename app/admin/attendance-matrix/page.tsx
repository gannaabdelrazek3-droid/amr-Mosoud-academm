'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface MatrixRow {
  playerId: string
  playerName: string
  coachName: string
  sports: string[]
  days: Record<number, string>
  presentCount: number
  absentCount: number
  attendanceRate: number
}

interface Coach { id: string; fullName: string }
interface Sport { id: string; name: string }

const statusColors: Record<string, string> = { PRESENT: '#22c55e', ABSENT: '#ef4444' }
const statusCycle = ['', 'PRESENT', 'ABSENT']

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

function getLocalDateString(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function AttendanceMatrixPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [coachId, setCoachId] = useState('')
  const [sportId, setSportId] = useState('')

  const [coaches, setCoaches] = useState<Coach[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [matrix, setMatrix] = useState<MatrixRow[]>([])
  const [daysInMonth, setDaysInMonth] = useState(30)
  const [todayPresent, setTodayPresent] = useState(0)
  const [todayAbsent, setTodayAbsent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<MatrixRow | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/coaches').then((r) => r.json()),
      fetch('/api/admin/sports-list').then((r) => r.json()),
    ]).then(([coachData, sportData]) => {
      setCoaches((coachData.coaches || []).map((c: { id: string; fullName: string }) => ({ id: c.id, fullName: c.fullName })))
      setSports(sportData.sports || [])
    })
  }, [])

  const loadMatrix = useCallback(() => {
    setLoading(true)
    const todayDate = getLocalDateString(new Date())
    const params = new URLSearchParams({ month: String(month), year: String(year), todayDate })
    if (coachId) params.set('coachId', coachId)
    if (sportId) params.set('sportId', sportId)

    fetch(`/api/admin/attendance-matrix?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setMatrix(data.matrix || [])
        setDaysInMonth(data.daysInMonth || 30)
        setTodayPresent(data.todayPresent || 0)
        setTodayAbsent(data.todayAbsent || 0)
      })
      .finally(() => setLoading(false))
  }, [month, year, coachId, sportId])

  useEffect(() => { loadMatrix() }, [loadMatrix])

  async function handleCellClick(row: MatrixRow, day: number) {
    if (!sportId) {
      alert('اختاري رياضة محددة أولاً لتقدري تعدّلي الحضور')
      return
    }
    const current = row.days[day] || ''
    const currentIdx = statusCycle.indexOf(current)
    const next = statusCycle[(currentIdx + 1) % statusCycle.length]

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    await fetch('/api/admin/attendance-matrix/set-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: row.playerId, sportId, date: dateStr, status: next || 'CLEAR' }),
    })

    loadMatrix()
  }

  if (loading && matrix.length === 0) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>لوحة الحضور المرورية</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>اضغطي على أي خانة للتبديل بين حاضر / غائب / بدون تسجيل</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 16, marginBottom: 24 }}>
          <div style={{ ...s.statCard, minWidth: 160 }}>
            <p style={s.statLabel}>✅ حاضرون اليوم</p>
            <p style={{ ...s.statValue, color: '#22c55e' }}>{todayPresent}</p>
          </div>
          <div style={{ ...s.statCard, minWidth: 160 }}>
            <p style={s.statLabel}>❌ غائبون اليوم</p>
            <p style={{ ...s.statValue, color: '#ef4444' }}>{todayAbsent}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' as const }}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ ...s.input, margin: 0, width: 'auto' }}>
            {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ ...s.input, margin: 0, width: 'auto' }}>
            {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={coachId} onChange={(e) => setCoachId(e.target.value)} style={{ ...s.input, margin: 0, width: 'auto' }}>
            <option value="">كل المدربين</option>
            {coaches.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
          <select value={sportId} onChange={(e) => setSportId(e.target.value)} style={{ ...s.input, margin: 0, width: 'auto' }}>
            <option value="">اختاري رياضة للتعديل</option>
            {sports.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: '#e2e8f0' }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 3, marginLeft: 5 }} /> حاضر</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 3, marginLeft: 5 }} /> غائب</span>
        </div>

        <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 12 }}>
          <table style={{ borderCollapse: 'collapse' as const, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'right' as const, color: '#d4af37', position: 'sticky' as const, right: 0, background: '#1e293b', minWidth: 140 }}>اللاعب</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' as const, color: '#d4af37', minWidth: 100 }}>المدرب</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <th key={d} style={{ padding: '4px 6px', color: '#94a3b8', fontSize: 11, minWidth: 26 }}>{d}</th>
                ))}
                <th style={{ padding: '8px 12px', color: '#d4af37', fontSize: 12 }}>%</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.playerId}>
                  <td onClick={() => setSelectedPlayer(row)} style={{ padding: '8px 12px', color: '#e2e8f0', fontSize: 13, fontWeight: 700, position: 'sticky' as const, right: 0, background: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                    {row.playerName}
                  </td>
                  <td style={{ padding: '8px 12px', color: '#94a3b8', fontSize: 12 }}>{row.coachName}</td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                    const status = row.days[d]
                    return (
                      <td key={d} style={{ padding: 2, textAlign: 'center' as const }}>
                        <div
                          onClick={() => handleCellClick(row, d)}
                          style={{ width: 20, height: 20, margin: '0 auto', borderRadius: 4, cursor: 'pointer', background: status ? statusColors[status] : 'rgba(148,163,184,0.15)' }}
                        />
                      </td>
                    )
                  })}
                  <td style={{ padding: '8px 12px', textAlign: 'center' as const, color: row.attendanceRate >= 70 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: 12.5 }}>
                    {row.attendanceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPlayer && (
          <div onClick={() => setSelectedPlayer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 18, padding: 28, maxWidth: 400, width: '100%' }}>
              <h3 style={{ color: '#f8fafc', marginBottom: 6 }}>{selectedPlayer.playerName}</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>تقرير الحضور - {monthNames[month - 1]} {year}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: 14, textAlign: 'center' as const }}>
                  <p style={{ color: '#22c55e', fontSize: 22, fontWeight: 900, margin: 0 }}>{selectedPlayer.presentCount}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>حضور</p>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 14, textAlign: 'center' as const }}>
                  <p style={{ color: '#ef4444', fontSize: 22, fontWeight: 900, margin: 0 }}>{selectedPlayer.absentCount}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>غياب</p>
                </div>
                <div style={{ background: 'rgba(212,175,55,0.1)', borderRadius: 10, padding: 14, textAlign: 'center' as const }}>
                  <p style={{ color: '#d4af37', fontSize: 22, fontWeight: 900, margin: 0 }}>{selectedPlayer.attendanceRate}%</p>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>الالتزام</p>
                </div>
              </div>

              <p style={{ color: '#e2e8f0', fontSize: 13 }}>🏋️ المدرب: {selectedPlayer.coachName}</p>
              <p style={{ color: '#e2e8f0', fontSize: 13 }}>🥋 الرياضات: {selectedPlayer.sports.join('، ')}</p>

              <button onClick={() => setSelectedPlayer(null)} style={{ width: '100%', marginTop: 16, padding: 12, background: 'rgba(148,163,184,0.15)', color: '#e2e8f0', border: 'none', borderRadius: 10, cursor: 'pointer' }}>إغلاق</button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}