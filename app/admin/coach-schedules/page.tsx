'use client'

import { useState, useEffect } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface Coach { id: string; fullName: string }
interface Sport { id: string; name: string }
interface Schedule {
  id: string
  coachId: string
  sportId: string
  groupName: string
  dayOfWeek: number
  time: string
  coach: { fullName: string }
  sport: { name: string }
}

const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

interface GroupedSchedule {
  key: string
  coachId: string
  coachName: string
  sportName: string
  groupName: string
  time: string
  days: number[]
}

export default function CoachSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [coachId, setCoachId] = useState('')
  const [sportId, setSportId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [time, setTime] = useState('')
  const [saving, setSaving] = useState(false)

  function loadAll() {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/coach-schedules').then((r) => r.json()),
      fetch('/api/admin/coaches').then((r) => r.json()),
      fetch('/api/admin/sports-list').then((r) => r.json()),
    ]).then(([schedData, coachData, sportData]) => {
      setSchedules(schedData.schedules || [])
      setCoaches((coachData.coaches || []).map((c: { id: string; fullName: string }) => ({ id: c.id, fullName: c.fullName })))
      setSports(sportData.sports || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  function toggleDay(day: number) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!coachId || !sportId || !groupName || !time || selectedDays.length === 0) {
      setMessage('من فضلك اختاري يوم واحد على الأقل')
      return
    }
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/coach-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachId, sportId, groupName, days: selectedDays, time }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setMessage(data.error || 'حدث خطأ'); return }

    setGroupName('')
    setTime('')
    setSelectedDays([])
    loadAll()
  }

  async function handleDeleteGroup(groupName: string, coachId: string) {
    if (!confirm(`حذف كل مواعيد مجموعة "${groupName}"؟`)) return
    await fetch(`/api/admin/coach-schedules?groupName=${encodeURIComponent(groupName)}&coachId=${coachId}`, { method: 'DELETE' })
    loadAll()
  }

  if (loading) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>

  // تجميع الجداول حسب المجموعة (مدرب + رياضة + اسم مجموعة + وقت) لعرضها كصف واحد بكل أيامها
  const grouped: GroupedSchedule[] = []
  schedules.forEach((sc) => {
    const key = `${sc.coachId}-${sc.sportId}-${sc.groupName}-${sc.time}`
    const existing = grouped.find((g) => g.key === key)
    if (existing) {
      existing.days.push(sc.dayOfWeek)
    } else {
      grouped.push({
        key, coachId: sc.coachId, coachName: sc.coach.fullName, sportName: sc.sport.name,
        groupName: sc.groupName, time: sc.time, days: [sc.dayOfWeek],
      })
    }
  })
  grouped.forEach((g) => g.days.sort((a, b) => a - b))

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>مواعيد التدريب</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>تحديد مواعيد كل مدرب ومجموعاته لكل رياضة (يمكن اختيار أكثر من يوم للمجموعة الواحدة)</p>
          </div>
        </div>

        {message && <p style={s.error}>{message}</p>}

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={{ color: '#d4af37', margin: '0 0 14px' }}>➕ إضافة موعد جديد</h3>
          <form onSubmit={handleAdd}>
            <label style={s.label}>
              المدرب
              <select value={coachId} onChange={(e) => setCoachId(e.target.value)} style={s.input} required>
                <option value="">اختر المدرب</option>
                {coaches.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </label>
            <label style={s.label}>
              الرياضة
              <select value={sportId} onChange={(e) => setSportId(e.target.value)} style={s.input} required>
                <option value="">اختر الرياضة</option>
                {sports.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
              </select>
            </label>
            <label style={s.label}>
              اسم المجموعة
              <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} style={s.input} placeholder="مثال: مجموعة الأطفال" required />
            </label>

            <label style={{ ...s.label, display: 'block' }}>أيام التدريب (يمكن اختيار أكثر من يوم)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 16 }}>
              {dayNames.map((d, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: selectedDays.includes(i) ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.5)', border: selectedDays.includes(i) ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(148,163,184,0.2)', padding: '8px 14px', borderRadius: 8, color: '#e2e8f0', fontSize: 13.5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedDays.includes(i)} onChange={() => toggleDay(i)} />
                  {d}
                </label>
              ))}
            </div>

            <label style={s.label}>
              الوقت
              <input type="text" value={time} onChange={(e) => setTime(e.target.value)} style={s.input} placeholder="مثال: 2:00 م" required />
            </label>
            <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
              {saving ? 'جارٍ الإضافة...' : 'إضافة الموعد'}
            </button>
          </form>
        </div>

        <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>المدرب</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>الرياضة</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>المجموعة</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>الأيام</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>الوقت</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}></th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((g) => (
                <tr key={g.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#e2e8f0' }}>{g.coachName}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{g.sportName}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{g.groupName}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{g.days.map((d) => dayNames[d]).join('، ')}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{g.time}</td>
                  <td style={{ padding: 12 }}>
                    <button onClick={() => handleDeleteGroup(g.groupName, g.coachId)} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}