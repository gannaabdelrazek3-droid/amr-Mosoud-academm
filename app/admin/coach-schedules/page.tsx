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

export default function CoachSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [coachId, setCoachId] = useState('')
  const [sportId, setSportId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('0')
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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!coachId || !sportId || !groupName || !time) return
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/coach-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachId, sportId, groupName, dayOfWeek: Number(dayOfWeek), time }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدث خطأ')
      return
    }

    setGroupName('')
    setTime('')
    loadAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا الموعد؟')) return
    await fetch(`/api/admin/coach-schedules?id=${id}`, { method: 'DELETE' })
    loadAll()
  }

  if (loading) {
    return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>مواعيد التدريب</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>تحديد مواعيد كل مدرب ومجموعاته لكل رياضة</p>
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
            <label style={s.label}>
              اليوم
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} style={s.input}>
                {dayNames.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </label>
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
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>اليوم</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>الوقت</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}></th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sc) => (
                <tr key={sc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#e2e8f0' }}>{sc.coach.fullName}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{sc.sport.name}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{sc.groupName}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{dayNames[sc.dayOfWeek]}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{sc.time}</td>
                  <td style={{ padding: 12 }}>
                    <button onClick={() => handleDelete(sc.id)} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>🗑️</button>
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