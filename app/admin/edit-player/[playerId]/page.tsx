'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminStyles as s } from '../../adminStyles'
import AdminShell from '../../AdminShell'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

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

interface Belt {
  id: string
  name: string
  color: string | null
}

interface SubscriptionItem {
  id: string
  remaining: number
  totalSessions: number
  endDate: string
  isFrozen: boolean
}

interface TournamentItem {
  id: string
  name: string
  year: number
  result: string | null
}

interface SkillRatingItem {
  id: string
  skillName: string
  value: number
  date: string
}

interface AttendanceItem {
  id: string
  sportName: string
  date: string
  present: boolean
  coachNote: string | null
}

interface WeightItem {
  id: string
  sportName: string
  weightKg: number
  date: string
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
  avatar_url?: string | null
  current_belt?: string | null
  target_belt?: string | null
  subscriptions: SubscriptionItem[]
  sports: { sport: { name: string } }[]
  tournaments: TournamentItem[]
  recentSkillRatings: SkillRatingItem[]
  attendances: AttendanceItem[]
  weightLogs: WeightItem[]
}

export default function EditPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.playerId as string

  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [allSports, setAllSports] = useState<Sport[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [belts, setBelts] = useState<Belt[]>([])
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

  // الحقول المحدثة للصورة والأحزمة
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentBelt, setCurrentBelt] = useState('')
  const [targetBelt, setTargetBelt] = useState('')

  const [subSessions, setSubSessions] = useState('')
  const [subEndDate, setSubEndDate] = useState('')

  const [tournamentName, setTournamentName] = useState('')
  const [tournamentYear, setTournamentYear] = useState('')
  const [tournamentResult, setTournamentResult] = useState('')
  const [addingTournament, setAddingTournament] = useState(false)

  const [attSportId, setAttSportId] = useState('')
  const [attDate, setAttDate] = useState('')
  const [attPresent, setAttPresent] = useState(true)
  const [attNote, setAttNote] = useState('')
  const [addingAttendance, setAddingAttendance] = useState(false)

  const [weightSportId, setWeightSportId] = useState('')
  const [weightValue, setWeightValue] = useState('')
  const [weightDate, setWeightDate] = useState('')
  const [addingWeight, setAddingWeight] = useState(false)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')

  const [nutritionPlans, setNutritionPlans] = useState<{ id: string; title: string; content: string; createdAt: string }[]>([])
  const [npTitle, setNpTitle] = useState('')
  const [npContent, setNpContent] = useState('')
  const [addingNp, setAddingNp] = useState(false)

  useEffect(() => {
    if (!playerId) return

    let isMounted = true
    setLoading(true)

    loadNutritionPlans()

    Promise.all([
      fetch(`/api/admin/player-details?playerId=${playerId}`).then((res) => res.json()),
      fetch('/api/admin/belts-list').then((res) => res.json()),
    ])
      .then(([data, beltsData]) => {
        if (!isMounted) return
        if (data.player) {
          setPlayer(data.player)
          setFullName(data.player.fullName)
          setPhone(data.player.phone || '')
          setBirthDate(data.player.birthDate ? data.player.birthDate.split('T')[0] : '')
          setSportsBackground(data.player.sportsBackground || '')
          setMedicalCheckExpiry(data.player.medicalCheckExpiry ? data.player.medicalCheckExpiry.split('T')[0] : '')
          setJoinDate(data.player.joinDate ? data.player.joinDate.split('T')[0] : '')
          setCoachId(data.player.coachId || '')
          
          setAvatarUrl(data.player.avatar_url || '')
          setCurrentBelt(data.player.current_belt || '')
          setTargetBelt(data.player.target_belt || '')

          setAllSports(data.allSports || [])
          setCoaches(data.coaches || [])
          setSelectedSportIds(data.playerSportIds || [])
          setSkillRatingsInitial(data.skillRatings || {})
        }
        if (beltsData.belts) {
          setBelts(beltsData.belts.filter((b: Belt & { isActive: boolean }) => b.isActive))
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [playerId])

  useEffect(() => {
    let isMounted = true

    if (selectedSportIds.length === 0) {
      setSkills([])
      return
    }

    Promise.all(
      selectedSportIds.map((sId) =>
        fetch(`/api/admin/skills?sportId=${sId}`).then((res) => res.json())
      )
    ).then((results) => {
      if (!isMounted) return
      const merged: Skill[] = []
      results.forEach((res, i) => {
        const sportName = allSports.find((sp) => sp.id === selectedSportIds[i])?.name || ''
        const sportSkills = (res.skills || []).map((sk: { id: string; name: string }) => ({
          id: sk.id,
          name: sk.name,
          sportName,
        }))
        merged.push(...sportSkills)
      })
      setSkills(merged)
    })

    return () => {
      isMounted = false
    }
  }, [selectedSportIds, allSports])

  function toggleSport(sportId: string) {
    setSelectedSportIds((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
    )
  }

  // دالة رفع الصورة إلى Supabase Storage (Bucket: player-avatars)
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('player-avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('player-avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)
      setMessage('تم رفع الصورة بنجاح!')
    } catch (error) {
      console.error(error)
      setMessage('حدث خطأ أثناء رفع الصورة.')
    } finally {
      setUploadingImage(false)
    }
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
        avatarUrl,
        currentBelt,
        targetBelt,
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
    
    const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
    const refetchData = await refetch.json()
    if (refetchData.player) {
      setPlayer(refetchData.player)
      setAvatarUrl(refetchData.player.avatar_url || '')
      setCurrentBelt(refetchData.player.current_belt || '')
      setTargetBelt(refetchData.player.target_belt || '')
      setSkillRatingsInitial(refetchData.skillRatings || {})
    }
  }

  async function handleToggleFreeze(subscriptionId: string) {
    await fetch('/api/admin/manage-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, action: 'toggle-freeze' }),
    })
    const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
    const refetchData = await refetch.json()
    if (refetchData.player) setPlayer(refetchData.player)
  }

  async function handleDeleteSubscription(subscriptionId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) return
    await fetch('/api/admin/manage-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, action: 'delete' }),
    })
    const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
    const refetchData = await refetch.json()
    if (refetchData.player) setPlayer(refetchData.player)
  }

  async function handleAddTournament(e: React.FormEvent) {
    e.preventDefault()
    if (!tournamentName || !tournamentYear) return
    setAddingTournament(true)
    const res = await fetch('/api/admin/manage-tournament', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, name: tournamentName, year: tournamentYear, result: tournamentResult }),
    })
    setAddingTournament(false)
    if (res.ok) {
      setTournamentName('')
      setTournamentYear('')
      setTournamentResult('')
      const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
      const refetchData = await refetch.json()
      if (refetchData.player) setPlayer(refetchData.player)
    } else {
      alert('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  async function handleDeleteTournament(tournamentId: string) {
    if (!confirm('هل أنت متأكد من حذف هذه البطولة؟')) return
    await fetch('/api/admin/manage-tournament', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId }),
    })
    const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
    const refetchData = await refetch.json()
    if (refetchData.player) setPlayer(refetchData.player)
  }

  async function handleDeleteSkillRating(ratingId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return
    await fetch('/api/admin/manage-skill-rating', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ratingId }),
    })
    const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
    const refetchData = await refetch.json()
    if (refetchData.player) {
      setPlayer(refetchData.player)
      setSkillRatingsInitial(refetchData.skillRatings || {})
    }
  }

  async function handleAddAttendance(e: React.FormEvent) {
    e.preventDefault()
    if (!attSportId || !attDate) return
    setAddingAttendance(true)
    const res = await fetch('/api/admin/manage-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId: attSportId, date: attDate, present: attPresent, coachNote: attNote }),
    })
    setAddingAttendance(false)
    if (res.ok) {
      setAttSportId('')
      setAttDate('')
      setAttPresent(true)
      setAttNote('')
      const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
      const refetchData = await refetch.json()
      if (refetchData.player) setPlayer(refetchData.player)
    } else {
      alert('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  async function handleDeleteAttendance(attendanceId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return
    await fetch('/api/admin/manage-attendance', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendanceId }),
    })
    const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
    const refetchData = await refetch.json()
    if (refetchData.player) setPlayer(refetchData.player)
  }

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault()
    if (!weightSportId || !weightValue) return
    setAddingWeight(true)
    const res = await fetch('/api/admin/manage-weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId: weightSportId, weightKg: weightValue, date: weightDate }),
    })
    setAddingWeight(false)
    if (res.ok) {
      setWeightSportId('')
      setWeightValue('')
      setWeightDate('')
      const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
      const refetchData = await refetch.json()
      if (refetchData.player) setPlayer(refetchData.player)
    } else {
      alert('حدثت مشكلة، حاول مرة أخرى')
    }
  }

  async function handleDeleteWeight(weightId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return
    await fetch('/api/admin/manage-weight', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weightId }),
    })
    const refetch = await fetch(`/api/admin/player-details?playerId=${playerId}`)
    const refetchData = await refetch.json()
    if (refetchData.player) setPlayer(refetchData.player)
  }

  function loadNutritionPlans() {
    fetch(`/api/nutrition-plans?playerId=${playerId}`)
      .then((res) => res.json())
      .then((data) => setNutritionPlans(data.plans || []))
  }

  async function handleAddNutritionPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!npTitle || !npContent) return
    setAddingNp(true)
    const res = await fetch('/api/nutrition-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, title: npTitle, content: npContent }),
    })
    setAddingNp(false)
    if (res.ok) {
      setNpTitle('')
      setNpContent('')
      loadNutritionPlans()
    }
  }

  async function handleDeleteNutritionPlan(id: string) {
    if (!confirm('حذف هذا البرنامج؟')) return
    await fetch(`/api/nutrition-plans?id=${id}`, { method: 'DELETE' })
    loadNutritionPlans()
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

  const sectionTitle = {
    color: '#d4af37',
    fontSize: 17,
    fontWeight: 900,
    margin: '0 0 16px',
    paddingBottom: 10,
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
  }

  const smallBtn = {
    padding: '7px 14px',
    borderRadius: 7,
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
    fontSize: 12.5,
    cursor: 'pointer',
    border: 'none',
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
        </div>

        <form onSubmit={handleSave}>
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

          {/* قسم الصورة والأحزمة (محدث لرفع الملفات) */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🥋 بيانات الصورة والأحزمة</h3>
            <label style={s.label}>
              صورة اللاعب (رفع ملف جديد)
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload} 
                style={s.input} 
              />
            </label>
            {uploadingImage && <p style={{ color: '#d4af37', fontSize: 13, marginTop: 5 }}>جاري رفع الصورة...</p>}
            {avatarUrl && <p style={{ color: '#22c55e', fontSize: 13, marginTop: 5, wordBreak: 'break-all' }}>تم اعتماد الصورة الحالية: {avatarUrl}</p>}

            <label style={s.label}>
              الحزام الحالي
              <select value={currentBelt} onChange={(e) => setCurrentBelt(e.target.value)} style={s.input}>
                <option value="">اختر الحزام الحالي</option>
                {belts.map((belt) => (
                  <option key={belt.id} value={belt.name}>{belt.name}</option>
                ))}
              </select>
            </label>

            <label style={s.label}>
              الحزام المطلوب
              <select value={targetBelt} onChange={(e) => setTargetBelt(e.target.value)} style={s.input}>
                <option value="">اختر الحزام المطلوب</option>
                {belts.map((belt) => (
                  <option key={belt.id} value={belt.name}>{belt.name}</option>
                ))}
              </select>
            </label>
          </div>

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

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📅 إضافة اشتراك جديد</h3>
            <label style={s.label}>
              عدد الحصص
              <input type="number" min={1} value={subSessions} onChange={(e) => setSubSessions(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              تاريخ انتهاء الاشتراك
              <input type="date" value={subEndDate} onChange={(e) => setSubEndDate(e.target.value)} style={s.input} />
            </label>
          </div>

          <button type="submit" disabled={saving || uploadingImage} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ جميع التعديلات'}
          </button>

          {message && <p style={{ ...s.error, marginTop: 15 }}>{message}</p>}
        </form>

        {player.recentSkillRatings.length > 0 && (
          <div style={{ ...s.formCard, marginTop: 24, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📊 سجل تقييمات المهارات</h3>
            {player.recentSkillRatings.map((r) => (
              <div key={r.id} style={rowStyle}>
                <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14 }}>
                  {r.skillName}: <strong style={{ color: '#d4af37' }}>{r.value}</strong> — {new Date(r.date).toLocaleDateString('ar-EG')}
                </p>
                <button
                  type="button"
                  onClick={() => handleDeleteSkillRating(r.id)}
                  style={{ ...smallBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={sectionTitle}>📋 كل الاشتراكات</h3>
          {player.subscriptions.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>لا توجد اشتراكات مسجّلة</p>
          ) : (
            player.subscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  ...rowStyle,
                  border: sub.isFrozen ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(148, 163, 184, 0.15)',
                }}
              >
                <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14 }}>
                  {sub.remaining} من {sub.totalSessions} حصة — ينتهي {new Date(sub.endDate).toLocaleDateString('ar-EG')}
                  {sub.isFrozen && <span style={{ color: '#60a5fa', marginRight: 8 }}>❄️ مجمّد</span>}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleToggleFreeze(sub.id)}
                    style={{ ...smallBtn, background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}
                  >
                    {sub.isFrozen ? 'إلغاء التجميد' : 'تجميد'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubscription(sub.id)}
                    style={{ ...smallBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={sectionTitle}>🏆 بطولات اللاعب</h3>

          {player.tournaments.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {player.tournaments.map((t) => (
                <div key={t.id} style={rowStyle}>
                  <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14 }}>
                    {t.name} ({t.year}) {t.result && `— ${t.result}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDeleteTournament(t.id)}
                    style={{ ...smallBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddTournament}>
            <label style={s.label}>
              اسم البطولة
              <input type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              السنة
              <input type="number" min={2000} max={2100} value={tournamentYear} onChange={(e) => setTournamentYear(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              النتيجة (اختياري)
              <input type="text" placeholder="مثال: المركز الأول" value={tournamentResult} onChange={(e) => setTournamentResult(e.target.value)} style={s.input} />
            </label>
            <button type="submit" disabled={addingTournament} className="btn-primary" style={{ ...s.button, marginTop: 12 }}>
              {addingTournament ? 'جارٍ الإضافة...' : '+ إضافة بطولة'}
            </button>
          </form>
        </div>

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={sectionTitle}>✅ سجل الحضور</h3>

          {player.attendances.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {player.attendances.map((a) => (
                <div key={a.id} style={rowStyle}>
                  <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14 }}>
                    {a.sportName} — {new Date(a.date).toLocaleDateString('ar-EG')} —{' '}
                    {a.present ? <span style={{ color: '#22c55e' }}>حضر</span> : <span style={{ color: '#fca5a5' }}>غاب</span>}
                    {a.coachNote && <span style={{ color: '#94a3b8' }}> — {a.coachNote}</span>}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDeleteAttendance(a.id)}
                    style={{ ...smallBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddAttendance}>
            <label style={s.label}>
              الرياضة
              <select value={attSportId} onChange={(e) => setAttSportId(e.target.value)} style={s.input}>
                <option value="">اختر الرياضة</option>
                {allSports
                  .filter((sp) => selectedSportIds.includes(sp.id))
                  .map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
              </select>
            </label>
            <label style={s.label}>
              التاريخ
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} style={s.input} />
            </label>
            <label style={s.checkboxLabel}>
              <input type="checkbox" checked={attPresent} onChange={(e) => setAttPresent(e.target.checked)} style={s.checkbox} />
              حضر الحصة
            </label>
            <label style={s.label}>
              ملاحظة (اختياري)
              <input type="text" value={attNote} onChange={(e) => setAttNote(e.target.value)} style={s.input} />
            </label>
            <button type="submit" disabled={addingAttendance} className="btn-primary" style={{ ...s.button, marginTop: 12 }}>
              {addingAttendance ? 'جارٍ الإضافة...' : '+ إضافة سجل حضور'}
            </button>
          </form>
        </div>

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={sectionTitle}>⚖️ تطور الوزن</h3>

          {player.weightLogs.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {player.weightLogs.map((w) => (
                <div key={w.id} style={rowStyle}>
                  <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14 }}>
                    {w.sportName} — {w.weightKg} كجم — {new Date(w.date).toLocaleDateString('ar-EG')}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDeleteWeight(w.id)}
                    style={{ ...smallBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddWeight}>
            <label style={s.label}>
              الرياضة
              <select value={weightSportId} onChange={(e) => setWeightSportId(e.target.value)} style={s.input}>
                <option value="">اختر الرياضة</option>
                {allSports
                  .filter((sp) => selectedSportIds.includes(sp.id))
                  .map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
              </select>
            </label>
            <label style={s.label}>
              الوزن (كجم)
              <input type="number" step="0.1" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              التاريخ (اختياري، الافتراضي اليوم)
              <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} style={s.input} />
            </label>
            <button type="submit" disabled={addingWeight} className="btn-primary" style={{ ...s.button, marginTop: 12 }}>
              {addingWeight ? 'جارٍ الإضافة...' : '+ إضافة وزن'}
            </button>
          </form>
        </div>

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={sectionTitle}>🥗 البرنامج الغذائي الخاص باللاعب</h3>
          {nutritionPlans.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {nutritionPlans.map((np) => (
                <div key={np.id} style={{ ...rowStyle, flexDirection: 'column' as const, alignItems: 'flex-start' as const }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <strong style={{ color: '#f8fafc', fontSize: 14.5 }}>{np.title}</strong>
                    <button type="button" onClick={() => handleDeleteNutritionPlan(np.id)} style={{ ...smallBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>حذف</button>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 13.5, margin: '6px 0 0', whiteSpace: 'pre-wrap' as const }}>{np.content}</p>
                  <span style={{ color: '#64748b', fontSize: 11.5, marginTop: 6 }}>{new Date(np.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAddNutritionPlan}>
            <label style={s.label}>
              عنوان البرنامج
              <input type="text" value={npTitle} onChange={(e) => setNpTitle(e.target.value)} style={s.input} placeholder="مثال: برنامج زيادة الكتلة العضلية" />
            </label>
            <label style={s.label}>
              تفاصيل البرنامج
              <textarea value={npContent} onChange={(e) => setNpContent(e.target.value)} style={{ ...s.input, minHeight: 120, resize: 'vertical' as const }} />
            </label>
            <button type="submit" disabled={addingNp} className="btn-primary" style={{ ...s.button, marginTop: 12 }}>
              {addingNp ? 'جارٍ الإضافة...' : '+ إضافة برنامج غذائي'}
            </button>
          </form>
        </div>

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