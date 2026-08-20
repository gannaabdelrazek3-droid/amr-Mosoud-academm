'use client'

import { useState, useEffect, useCallback } from 'react'
import { safeFetchJson } from '@/lib/safeFetch'

interface PlayerRow { id: string; fullName: string; alreadyMarked: 'PRESENT' | 'ABSENT' | null }
interface Group {
  scheduleId: string
  coachId: string
  coachName: string
  sportId: string
  sportName: string
  groupName: string
  time: string
  players: PlayerRow[]
}
interface UngroupedPlayer { id: string; fullName: string; sportIds: string[] }

const pageStyle = { background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px' }

function getLocalDateString(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function SecretaryAttendancePage() {
  const [date, setDate] = useState(() => getLocalDateString(new Date()))
  const [groups, setGroups] = useState<Group[]>([])
  const [ungrouped, setUngrouped] = useState<UngroupedPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [localMarks, setLocalMarks] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)

  const loadGroups = useCallback(async (clearOldMessage: boolean) => {
    setLoading(true)
    if (clearOldMessage) {
      setMessage('')
      setSaved(false)
    }
    const { ok, data, error } = await safeFetchJson<{ groups: Group[]; ungroupedPlayers: UngroupedPlayer[] }>(
      `/api/secretary/attendance-groups?date=${date}`
    )
    if (ok && data) {
      setGroups(data.groups || [])
      setUngrouped(data.ungroupedPlayers || [])
    } else if (error) {
      setMessage(error)
      setSaved(false)
    }
    setLoading(false)
  }, [date])

  function handleDateChange(newDate: string) {
    setDate(newDate)
    setLocalMarks({})
    setMessage('')
    setSaved(false)
  }

  useEffect(() => {
    loadGroups(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // تم التعديل: استخدام الفاصل المزدوج :: لتجنب التعارض مع الـ UUID
  function mark(playerId: string, sportId: string, present: boolean) {
    const key = `${playerId}::${sportId}`
    setLocalMarks((prev) => ({ ...prev, [key]: present }))
    setSaved(false)
    setMessage('')
  }

  const markedCount = Object.keys(localMarks).length

  // تم التعديل: التقسيم الصحيح والآمن باستخدام الفاصل المزدوج
  async function handleSaveAll() {
    if (markedCount === 0) {
      setMessage('لم يتم تحديد أي حضور أو غياب بعد')
      setSaved(false)
      return
    }
    setSaving(true)
    setMessage('')

    const records = Object.entries(localMarks).map(([key, present]) => {
      const [playerId, sportId] = key.split('::')
      return { playerId, sportId, present }
    })

    const { ok, data, error } = await safeFetchJson<{ savedCount: number; skippedCount: number; dateKey: string }>(
      '/api/secretary/mark-attendance-batch',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, date }),
      }
    )

    setSaving(false)

    if (!ok || !data) {
      setSaved(false)
      setMessage(error || 'حدث خطأ أثناء الحفظ')
      return
    }

    setSaved(true)
    setMessage(`✅ تم حفظ ${data.savedCount} سجل بنجاح`)
    setLocalMarks({})
    loadGroups(false)
  }

  function renderPlayerRow(playerId: string, sportId: string, playerName: string, alreadyMarked: 'PRESENT' | 'ABSENT' | null) {
    const key = `${playerId}::${sportId}`
    const local = localMarks[key]
    const displayStatus = local !== undefined ? (local ? 'PRESENT' : 'ABSENT') : alreadyMarked

    return (
      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.5)', borderRadius: 8, padding: '8px 12px', marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, color: '#e2e8f0' }}>
          {playerName} {alreadyMarked && <span style={{ color: '#64748b', fontSize: 11 }}>(محفوظ)</span>}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => mark(playerId, sportId, true)}
            style={{ padding: '6px 14px', background: displayStatus === 'PRESENT' ? '#22c55e' : 'rgba(34,197,94,0.15)', color: displayStatus === 'PRESENT' ? '#0f172a' : '#22c55e', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}
          >✅ حضور</button>
          <button
            onClick={() => mark(playerId, sportId, false)}
            style={{ padding: '6px 14px', background: displayStatus === 'ABSENT' ? '#ef4444' : 'rgba(239,68,68,0.15)', color: displayStatus === 'ABSENT' ? '#fff' : '#ef4444', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}
          >❌ غياب</button>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 800, margin: '0 auto', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>تسجيل الحضور اليومي</h1>
        <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>التاريخ</label>
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          style={{ padding: '10px 14px', fontSize: 14, border: '1px solid rgba(148,163,184,0.3)', borderRadius: 8, background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', marginBottom: 20 }}
        />

        {message && <p style={{ color: saved ? '#22c55e' : '#fca5a5', marginBottom: 16, fontWeight: 700 }}>{message}</p>}

        {loading ? <p>جارٍ التحميل...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 90 }}>
            {groups.map((g) => (
              <div key={g.scheduleId} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 14, padding: 16 }}>
                <strong style={{ color: '#d4af37' }}>{g.groupName}</strong>
                {g.players.map((p) => renderPlayerRow(p.id, g.sportId, p.fullName, p.alreadyMarked))}
              </div>
            ))}
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.98)', padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleSaveAll}
            disabled={saving || markedCount === 0}
            style={{ padding: '14px 50px', background: markedCount > 0 ? '#d4af37' : '#475569', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, cursor: markedCount > 0 ? 'pointer' : 'not-allowed' }}
          >
            {saving ? 'جارٍ الحفظ...' : `💾 حفظ (${markedCount})`}
          </button>
        </div>
      </div>
    </div>
  )
}