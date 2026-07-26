'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminStyles as s } from '../../adminStyles'
import AdminShell from '../../AdminShell'

interface Sport {
  id: string
  name: string
}

interface Coach {
  id: string
  fullName: string
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
  email: string | null
  medicalCheckExpiry: string | null
  joinDate: string | null
  coachId: string | null
  subscriptions: { id: string; remaining: number; totalSessions: number; endDate: string }[]
  sports: { sport: { name: string } }[]
}

export default function EditPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.playerId as string

  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [allSports, setAllSports] = useState<Sport[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [playerSportIds, setPlayerSportIds] = useState<string[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillRatingsInitial, setSkillRatingsInitial] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
  const [medicalCheckExpiry, setMedicalCheckExpiry] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [coachId, setCoachId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([])
  const [skillRatings, setSkillRatings] = useState<Record<string, string>>({})

  const [subSessions, setSubSessions] = useState('')
  const [subEndDate, setSubEndDate] = useState('')

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')

  function loadData() {
    fetch(`/api/admin/player-details?playerId=${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.player) {
          setPlayer(data.player)
          setFullName(data.player.fullName)
          setPhone(data.player.phone || '')
          setBirthDate(data.player.birthDate ? data.player.birthDate.split('T')[0] : '')
          setSportsBackground(data.player.sportsBackground || '')
          setMedicalCheckExpiry(data.player.medicalCheckExpiry ? data.player.medicalCheckExpiry.split('T')[0] : '')
          setJoinDate(data.player.joinDate ? data.player.joinDate.split('T')[0] : '')
          setCoachId(data.player.coachId || '')
          setAllSports(data.allSports || [])
          setCoaches(data.coaches || [])
          setPlayerSportIds(data.playerSportIds || [])
          setSelectedSportIds(data.playerSportIds || [])
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

  function toggleSport(sportId: string) {
    setSelectedSportIds((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const newSubscription =
      subSessions && subEndDate ? { totalSessions: subSessions, endDate: subEndDate } : null

    const res = await fetch('/api/admin/edit-player', {
      method: 'POST',
      body: JSON.stringify({
        playerId,
        fullName,
        phone,
        birthDate,
        sportsBackground,
        medicalCheckExpiry,
        joinDate,
        coachId,
        newPassword,
        sportIds: selectedSportIds,
        newSubscription,
        skillRatings,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة')
      return
    }
    setMessage('تم الحفظ بنجاح ✓')
    setNewPassword('')
    setSubSessions('')
    setSubEndDate('')
    setSkillRatings({})
    loadData()
  }

  async function handleDelete() {
    if (!confirm('هل أنت متأكد من حذف هذا اللاعب نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.')) return
    setDeleting(true)
    const res = await fetch('/api/admin/edit-player', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    })
    setDeleting(false)
    if (res.ok) {
      router.push('/dashboard')
    } else {
      alert('حدثت مشكلة أثناء الحذف')
    }
  }

  if (loading) {
    return (
      <AdminShell fullName="">
        <div style={s.page}>
          <p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p>
        </div>
      </AdminShell>
    )
  }
  if (!player) {
    return (
      <AdminShell fullName="">
        <div style={s.page}>
          <p style={{ color: '#e2e8f0' }}>اللاعب غير موجود</p>
        </div>
      </AdminShell>
    )
  }

  const activeSub = player.subscriptions[0]

  const sectionTitle = {
    color: '#d4af37',
    fontSize: 17,
    fontWeight: 900,
    margin: '0 0 16px',
    paddingBottom: 10,
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>{player.fullName}</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>تعديل بيانات اللاعب</p>
          </div>
        </div>

        <div style={{ ...s.statCard, marginBottom: 24, maxWidth: 640 }}>
          <p style={{ margin: '4px 0', color: '#e2e8f0' }}>📧 {player.email || 'لا يوجد حساب دخول'}</p>
          <p style={{ margin: '4px 0', color: '#e2e8f0' }}>
            🏅 الرياضات: {player.sports.map((sp) => sp.sport.name).join('، ') || 'لا توجد'}
          </p>
          <p style={{ margin: '4px 0', color: '#e2e8f0' }}>
            📅 الاشتراك:{' '}
            {activeSub
              ? `${activeSub.remaining} من ${activeSub.totalSessions} حصة، ينتهي ${new Date(activeSub.endDate).toLocaleDateString('ar-EG')}`
              : 'لا يوجد اشتراك نشط'}
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* بيانات أساسية */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📝 البيانات الأساسية</h3>
            <label style={s.label}>
              الاسم الكامل
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              رقم الهاتف
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              تاريخ الميلاد
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              الخلفية الرياضية
              <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              تاريخ الانضمام للأكاديمية
              <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              تاريخ انتهاء الكشف الطبي
              <input type="date" value={medicalCheckExpiry} onChange={(e) => setMedicalCheckExpiry(e.target.value)} style={s.input} />
            </label>

            {player.email && (
              <label style={s.label}>
                كلمة مرور جديدة (اتركها فارغة إذا لا ترغب بالتغيير)
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={s.input} minLength={6} />
              </label>
            )}
          </div>

          {/* المدرب */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🏋️ المدرب المسؤول</h3>
            <label style={s.label}>
              نقل اللاعب لمدرب آخر
              <select value={coachId} onChange={(e) => setCoachId(e.target.value)} style={s.input}>
                <option value="">بدون مدرب</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </label>
          </div>

          {/* الرياضات */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🏅 الرياضات المسجّل بها</h3>
            {allSports.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>لا توجد رياضات مضافة في الأكاديمية بعد</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {allSports.map((sport) => (
                  <label
                    key={sport.id}
                    style={{
                      ...s.checkboxLabel,
                      background: selectedSportIds.includes(sport.id) ? 'rgba(212,175,55,0.15)' : s.checkboxLabel.background,
                      border: selectedSportIds.includes(sport.id) ? '1px solid rgba(212,175,55,0.4)' : 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSportIds.includes(sport.id)}
                      onChange={() => toggleSport(sport.id)}
                      style={s.checkbox}
                    />
                    {sport.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* المهارات */}
          {skills.length > 0 && (
            <div style={{ ...s.formCard, marginBottom: 20 }}>
              <h3 style={sectionTitle}>🎯 تقييم المهارات</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
                أدخل تقييمًا جديدًا (من 0 إلى 100) للمهارات المراد تحديثها فقط، واترك الباقي فارغًا
              </p>
              {skills.map((skill) => (
                <label key={skill.id} style={s.label}>
                  {skill.name} <span style={{ color: '#94a3b8', fontSize: 12 }}>({skill.sportName})</span>
                  {skillRatingsInitial[skill.id] !== undefined && (
                    <span style={{ color: '#d4af37', fontSize: 13, marginRight: 8 }}>
                      — الحالي: {skillRatingsInitial[skill.id]}
                    </span>
                  )}
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="اتركه فارغًا لعدم التغيير"
                    value={skillRatings[skill.id] || ''}
                    onChange={(e) => setSkillRatings((prev) => ({ ...prev, [skill.id]: e.target.value }))}
                    style={s.input}
                  />
                </label>
              ))}
            </div>
          )}

          {/* الاشتراك */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📅 إضافة اشتراك جديد</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
              إضافة اشتراك جديد لا تلغي الاشتراك الحالي، وستُحسب كأحدث اشتراك للاعب
            </p>
            <label style={s.label}>
              عدد الحصص
              <input
                type="number"
                min={1}
                value={subSessions}
                onChange={(e) => setSubSessions(e.target.value)}
                style={s.input}
              />
            </label>
            <label style={s.label}>
              تاريخ انتهاء الاشتراك
              <input
                type="date"
                value={subEndDate}
                onChange={(e) => setSubEndDate(e.target.value)}
                style={s.input}
              />
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ جميع التعديلات'}
          </button>

          {message && <p style={s.error}>{message}</p>}
        </form>

        <div style={{ marginTop: 30, borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: 20 }}>
          <h3 style={{ color: '#fca5a5', fontSize: 15, fontWeight: 800, marginBottom: 10 }}>⚠️ منطقة الخطر</h3>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '12px 24px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 10,
              fontWeight: 700,
              fontFamily: "'Tajawal', sans-serif",
              cursor: 'pointer',
            }}
          >
            {deleting ? 'جارٍ الحذف...' : 'حذف اللاعب نهائيًا'}
          </button>
        </div>
      </div>
    </AdminShell>
  )
}