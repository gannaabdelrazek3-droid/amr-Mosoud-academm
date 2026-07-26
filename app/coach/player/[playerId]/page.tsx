'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Sport {
  id: string
  name: string
}

interface Skill {
  id: string
  name: string
  sportName: string
}

interface PlayerDetails {
  id: string
  fullName: string
  phone: string | null
  birthDate: string | null
  sportsBackground: string | null
  medicalCheckExpiry: string | null
  subscriptions: { id: string; remaining: number; totalSessions: number; endDate: string; isFrozen: boolean }[]
  sports: { sport: { name: string } }[]
  tournaments: { id: string; name: string; year: number; result: string | null }[]
  recentSkillRatings: { id: string; skillName: string; value: number; date: string }[]
  attendances: { id: string; sportName: string; date: string; present: boolean; coachNote: string | null }[]
  weightLogs: { id: string; sportName: string; weightKg: number; date: string }[]
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
  marginTop: 8,
  marginBottom: 4,
}

const labelStyle = {
  display: 'block' as const,
  color: '#cbd5e1',
  fontWeight: 700,
  fontSize: 14,
  marginTop: 14,
}

const cardStyle = {
  background: 'rgba(30, 41, 59, 0.6)',
  border: '1px solid rgba(212, 175, 55, 0.25)',
  borderRadius: 16,
  padding: 22,
  marginBottom: 20,
}

const sectionTitle = {
  color: '#d4af37',
  fontSize: 16,
  fontWeight: 900,
  margin: '0 0 14px',
}

const rowStyle = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  flexWrap: 'wrap' as const,
  gap: 10,
  background: 'rgba(15, 23, 42, 0.5)',
  borderRadius: 10,
  padding: '10px 16px',
  marginBottom: 8,
}

const buttonStyle = {
  width: '100%',
  padding: 12,
  fontSize: 15,
  fontWeight: 700,
  fontFamily: "'Tajawal', sans-serif",
  background: '#d4af37',
  color: '#0f172a',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  marginTop: 14,
}

export default function CoachPlayerPage() {
  const params = useParams()
  const playerId = params.playerId as string

  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [allowedSports, setAllowedSports] = useState<Sport[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillRatingsInitial, setSkillRatingsInitial] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
  const [medicalCheckExpiry, setMedicalCheckExpiry] = useState('')
  const [skillRatings, setSkillRatings] = useState<Record<string, string>>({})

  const [subSessions, setSubSessions] = useState('')
  const [subEndDate, setSubEndDate] = useState('')

  const [tournamentName, setTournamentName] = useState('')
  const [tournamentYear, setTournamentYear] = useState('')
  const [tournamentResult, setTournamentResult] = useState('')

  const [attSportId, setAttSportId] = useState('')
  const [attDate, setAttDate] = useState('')
  const [attPresent, setAttPresent] = useState(true)
  const [attNote, setAttNote] = useState('')

  const [weightSportId, setWeightSportId] = useState('')
  const [weightValue, setWeightValue] = useState('')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function loadData() {
    fetch(`/api/coach/player-details?playerId=${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.player) {
          setPlayer(data.player)
          setPhone(data.player.phone || '')
          setBirthDate(data.player.birthDate ? data.player.birthDate.split('T')[0] : '')
          setSportsBackground(data.player.sportsBackground || '')
          setMedicalCheckExpiry(data.player.medicalCheckExpiry ? data.player.medicalCheckExpiry.split('T')[0] : '')
          setAllowedSports(data.allowedSports || [])
          setSkills(data.skills || [])
          setSkillRatingsInitial(data.skillRatings || {})
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!playerId) return
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const newSubscription = subSessions && subEndDate ? { totalSessions: subSessions, endDate: subEndDate } : null

    const res = await fetch('/api/coach/edit-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, phone, birthDate, sportsBackground, medicalCheckExpiry, newSubscription, skillRatings }),
    })
    setSaving(false)
    if (res.ok) {
      setMessage('تم الحفظ بنجاح ✓')
      setSubSessions('')
      setSubEndDate('')
      setSkillRatings({})
      loadData()
    } else {
      setMessage('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  async function handleAddTournament(e: React.FormEvent) {
    e.preventDefault()
    if (!tournamentName || !tournamentYear) return
    const res = await fetch('/api/coach/manage-tournament', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, name: tournamentName, year: tournamentYear, result: tournamentResult }),
    })
    if (res.ok) {
      setTournamentName('')
      setTournamentYear('')
      setTournamentResult('')
      loadData()
    }
  }

  async function handleAddAttendance(e: React.FormEvent) {
    e.preventDefault()
    if (!attSportId || !attDate) return
    const res = await fetch('/api/coach/manage-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId: attSportId, date: attDate, present: attPresent, coachNote: attNote }),
    })
    if (res.ok) {
      setAttSportId('')
      setAttDate('')
      setAttPresent(true)
      setAttNote('')
      loadData()
    }
  }

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault()
    if (!weightSportId || !weightValue) return
    const res = await fetch('/api/coach/manage-weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId: weightSportId, weightKg: weightValue }),
    })
    if (res.ok) {
      setWeightSportId('')
      setWeightValue('')
      loadData()
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', padding: 32, color: '#e2e8f0', fontFamily: "'Tajawal', sans-serif" }}>
        جارٍ التحميل...
      </div>
    )
  }
  if (!player) {
    return (
      <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', padding: 32, color: '#e2e8f0', fontFamily: "'Tajawal', sans-serif" }}>
        اللاعب غير موجود أو ليس ضمن فريقك
      </div>
    )
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>{player.fullName}</h1>
        <p style={{ color: '#94a3b8' }}>الرياضات: {player.sports.map((sp) => sp.sport.name).join('، ') || 'لا توجد'}</p>

        <form onSubmit={handleSave}>
          <div style={cardStyle}>
            <h3 style={sectionTitle}>📝 البيانات الأساسية</h3>
            <label style={labelStyle}>رقم الهاتف</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>تاريخ الميلاد</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>الخلفية الرياضية</label>
            <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>تاريخ انتهاء الكشف الطبي</label>
            <input type="date" value={medicalCheckExpiry} onChange={(e) => setMedicalCheckExpiry(e.target.value)} style={inputStyle} />
          </div>

          {skills.length > 0 && (
            <div style={cardStyle}>
              <h3 style={sectionTitle}>🎯 تقييم المهارات</h3>
              {skills.map((skill) => (
                <div key={skill.id}>
                  <label style={labelStyle}>
                    {skill.name} ({skill.sportName})
                    {skillRatingsInitial[skill.id] !== undefined && (
                      <span style={{ color: '#d4af37', marginRight: 8 }}> — الحالي: {skillRatingsInitial[skill.id]}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="اتركه فارغًا لعدم التغيير"
                    value={skillRatings[skill.id] || ''}
                    onChange={(e) => setSkillRatings((prev) => ({ ...prev, [skill.id]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={cardStyle}>
            <h3 style={sectionTitle}>📅 إضافة اشتراك جديد</h3>
            <label style={labelStyle}>عدد الحصص</label>
            <input type="number" min={1} value={subSessions} onChange={(e) => setSubSessions(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>تاريخ الانتهاء</label>
            <input type="date" value={subEndDate} onChange={(e) => setSubEndDate(e.target.value)} style={inputStyle} />
          </div>

          <button type="submit" disabled={saving} style={buttonStyle}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </button>
          {message && <p style={{ color: '#22c55e', marginTop: 10 }}>{message}</p>}
        </form>

        {player.subscriptions.length > 0 && (
          <div style={cardStyle}>
            <h3 style={sectionTitle}>📋 الاشتراكات</h3>
            {player.subscriptions.map((sub) => (
              <div key={sub.id} style={rowStyle}>
                <p style={{ margin: 0, fontSize: 14 }}>
                  {sub.remaining} من {sub.totalSessions} حصة — ينتهي {new Date(sub.endDate).toLocaleDateString('ar-EG')}
                  {sub.isFrozen && <span style={{ color: '#60a5fa' }}> ❄️ مجمّد</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={cardStyle}>
          <h3 style={sectionTitle}>🏆 البطولات</h3>
          {player.tournaments.map((t) => (
            <div key={t.id} style={rowStyle}>
              <p style={{ margin: 0, fontSize: 14 }}>{t.name} ({t.year}) {t.result && `— ${t.result}`}</p>
            </div>
          ))}
          <form onSubmit={handleAddTournament}>
            <label style={labelStyle}>اسم البطولة</label>
            <input type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>السنة</label>
            <input type="number" value={tournamentYear} onChange={(e) => setTournamentYear(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>النتيجة (اختياري)</label>
            <input type="text" value={tournamentResult} onChange={(e) => setTournamentResult(e.target.value)} style={inputStyle} />
            <button type="submit" style={buttonStyle}>+ إضافة بطولة</button>
          </form>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>✅ سجل الحضور</h3>
          {player.attendances.map((a) => (
            <div key={a.id} style={rowStyle}>
              <p style={{ margin: 0, fontSize: 14 }}>
                {a.sportName} — {new Date(a.date).toLocaleDateString('ar-EG')} — {a.present ? 'حضر' : 'غاب'}
              </p>
            </div>
          ))}
          <form onSubmit={handleAddAttendance}>
            <label style={labelStyle}>الرياضة</label>
            <select value={attSportId} onChange={(e) => setAttSportId(e.target.value)} style={inputStyle}>
              <option value="">اختر</option>
              {allowedSports.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
            <label style={labelStyle}>التاريخ</label>
            <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} style={inputStyle} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 14 }}>
              <input type="checkbox" checked={attPresent} onChange={(e) => setAttPresent(e.target.checked)} />
              حضر الحصة
            </label>
            <label style={labelStyle}>ملاحظة</label>
            <input type="text" value={attNote} onChange={(e) => setAttNote(e.target.value)} style={inputStyle} />
            <button type="submit" style={buttonStyle}>+ إضافة سجل حضور</button>
          </form>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>⚖️ تطور الوزن</h3>
          {player.weightLogs.map((w) => (
            <div key={w.id} style={rowStyle}>
              <p style={{ margin: 0, fontSize: 14 }}>{w.sportName} — {w.weightKg} كجم — {new Date(w.date).toLocaleDateString('ar-EG')}</p>
            </div>
          ))}
          <form onSubmit={handleAddWeight}>
            <label style={labelStyle}>الرياضة</label>
            <select value={weightSportId} onChange={(e) => setWeightSportId(e.target.value)} style={inputStyle}>
              <option value="">اختر</option>
              {allowedSports.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
            <label style={labelStyle}>الوزن (كجم)</label>
            <input type="number" step="0.1" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} style={inputStyle} />
            <button type="submit" style={buttonStyle}>+ إضافة وزن</button>
          </form>
        </div>
      </div>
    </div>
  )
}