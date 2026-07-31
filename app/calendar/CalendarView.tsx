'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type EventItem = {
  id: string
  title: string
  type: 'TRAINING' | 'TOURNAMENT' | 'TEST' | 'ACTIVITY' | 'MATCH' | 'MEETING' | 'CAMP' | 'OTHER'
  date: string
  time: string | null
  location: string | null
  category: string | null
  notes: string | null
  sportName: string | null
}

type Sport = { id: string; name: string }

const typeInfo = {
  TRAINING: { label: 'تدريب', color: '#3b82f6', icon: '🥊' },
  TOURNAMENT: { label: 'بطولة', color: '#ef4444', icon: '🏆' },
  TEST: { label: 'اختبار', color: '#eab308', icon: '📝' },
  ACTIVITY: { label: 'فعالية', color: '#22c55e', icon: '🎉' },
  MATCH: { label: 'مباراة', color: '#a855f7', icon: '⚔️' },
  MEETING: { label: 'اجتماع', color: '#06b6d4', icon: '📅' },
  CAMP: { label: 'معسكر', color: '#f97316', icon: '⛺' },
  OTHER: { label: 'أخرى', color: '#64748b', icon: '📌' },
}

const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const monthNames = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

export default function CalendarView({
  events,
  canManage,
  sports,
}: {
  events: EventItem[]
  canManage: boolean
  sports: Sport[]
}) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<keyof typeof typeInfo>('TRAINING')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [sportId, setSportId] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startWeekday = firstDayOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function getEventsForDay(day: number) {
    return events.filter((e) => {
      const ed = new Date(e.date)
      return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === day
    })
  }

  function changeMonth(delta: number) {
    setCurrentDate(new Date(year, month + delta, 1))
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !date) return
    setLoading(true)
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, date, time, location, category, notes, sportId }),
    })
    setLoading(false)
    if (res.ok) {
      setShowAddForm(false)
      setTitle('')
      setDate('')
      setTime('')
      setLocation('')
      setCategory('')
      setNotes('')
      setSportId('')
      router.refresh()
    } else {
      alert('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الحدث؟')) return
    setLoading(true)
    const res = await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    })
    setLoading(false)
    if (res.ok) {
      setSelectedEvent(null)
      router.refresh()
    } else {
      alert('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  return (
    <div style={{ fontFamily: "'Tajawal', sans-serif" }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(typeInfo).map(([key, info]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e2e8f0' }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: info.color, display: 'inline-block' }} />
            {info.icon} {info.label}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button
          onClick={() => changeMonth(-1)}
          style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
        >
          ← السابق
        </button>
        <h2 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 900, margin: 0 }}>
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
        >
          التالي →
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {weekDays.map((wd) => (
          <div key={wd} style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 700, fontSize: 13, padding: '6px 0' }}>
            {wd}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const dayEvents = getEventsForDay(day)
          const isToday =
            day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

          return (
            <div
              key={i}
              style={{
                minHeight: 80,
                background: 'rgba(30, 41, 59, 0.6)',
                border: isToday ? '2px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.15)',
                borderRadius: 10,
                padding: 6,
              }}
            >
              <span style={{ color: isToday ? '#d4af37' : '#94a3b8', fontSize: 12, fontWeight: 700 }}>{day}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                {dayEvents.map((ev) => {
                  const currentTypeInfo = typeInfo[ev.type] || { color: '#64748b', icon: '📌' }
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      style={{
                        background: currentTypeInfo.color + '30',
                        borderRight: `3px solid ${currentTypeInfo.color}`,
                        color: '#f1f5f9',
                        fontSize: 10.5,
                        padding: '3px 5px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {currentTypeInfo.icon} {ev.title}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* زرار إضافة حدث - أدمن بس */}
      {canManage && (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            position: 'fixed',
            bottom: 30,
            left: 30,
            zIndex: 999,
            background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
            color: '#0f172a',
            border: 'none',
            borderRadius: 50,
            padding: '14px 28px',
            fontWeight: 900,
            fontSize: 15,
            fontFamily: 'inherit',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          + إضافة حدث
        </button>
      )}

      {/* نافذة تفاصيل الحدث */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 18,
              padding: 28, maxWidth: 420, width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 26 }}>{typeInfo[selectedEvent.type]?.icon || '📌'}</span>
              <h3 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 900, margin: 0 }}>{selectedEvent.title}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#e2e8f0', fontSize: 14.5 }}>
              <p style={{ margin: 0 }}>📅 التاريخ: {new Date(selectedEvent.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              {selectedEvent.time && <p style={{ margin: 0 }}>⏰ الساعة: {selectedEvent.time}</p>}
              {selectedEvent.location && <p style={{ margin: 0 }}>📍 المكان: {selectedEvent.location}</p>}
              {selectedEvent.sportName && <p style={{ margin: 0 }}>🥋 الرياضة: {selectedEvent.sportName}</p>}
              {selectedEvent.category && <p style={{ margin: 0 }}>👥 الفئة: {selectedEvent.category}</p>}
              {selectedEvent.notes && <p style={{ margin: 0 }}>📝 ملاحظات: {selectedEvent.notes}</p>}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ flex: 1, padding: 12, background: 'rgba(148,163,184,0.15)', color: '#e2e8f0', border: 'none', borderRadius: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                إغلاق
              </button>
              {canManage && (
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  disabled={loading}
                  style={{ flex: 1, padding: 12, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  حذف الحدث
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة حدث - أدمن بس */}
      {showAddForm && canManage && (
        <div
          onClick={() => setShowAddForm(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 18,
              padding: 28, maxWidth: 460, width: '100%', maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <h3 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 900, marginBottom: 20 }}>إضافة حدث جديد</h3>

            <form onSubmit={handleAddEvent}>
              <label style={labelStyle}>اسم الحدث</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />

              <label style={labelStyle}>نوع الحدث</label>
              <select value={type} onChange={(e) => setType(e.target.value as keyof typeof typeInfo)} style={inputStyle}>
                <option value="TRAINING">🥊 تدريب</option>
                <option value="TOURNAMENT">🏆 بطولة</option>
                <option value="TEST">📝 اختبار</option>
                <option value="ACTIVITY">🎉 فعالية</option>
                <option value="MATCH">⚔️ مباراة</option>
                <option value="MEETING">📅 اجتماع</option>
                <option value="CAMP">⛺ معسكر</option>
                <option value="OTHER">📌 أخرى</option>
              </select>

              <label style={labelStyle}>التاريخ</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />

              <label style={labelStyle}>الوقت (اختياري)</label>
              <input type="text" placeholder="مثال: 6:00 م" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>المكان (اختياري)</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>الرياضة (اتركه فارغًا ليكون الحدث عامًا للجميع)</label>
              <select value={sportId} onChange={(e) => setSportId(e.target.value)} style={inputStyle}>
                <option value="">عام - لكل الأكاديمية</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <label style={labelStyle}>الفئة/المجموعة (اختياري)</label>
              <input placeholder="مثال: تحت 18 سنة" value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>ملاحظات (اختياري)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' as const }} />

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ flex: 1, padding: 12, background: 'rgba(148,163,184,0.15)', color: '#e2e8f0', border: 'none', borderRadius: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: 12, background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 10, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  {loading ? 'جارٍ الإضافة...' : 'إضافة الحدث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = {
  display: 'block' as const,
  color: '#cbd5e1',
  fontWeight: 700,
  fontSize: 13,
  marginTop: 14,
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 14,
  fontFamily: "'Tajawal', sans-serif",
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f1f5f9',
  boxSizing: 'border-box' as const,
}