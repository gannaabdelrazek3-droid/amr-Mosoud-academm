'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminStyles as s } from '../../adminStyles'
import AdminShell from '../../AdminShell'
import { createClient } from '@supabase/supabase-js'
import { safeFetchJson } from '@/lib/safeFetch'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface Sport { id: string; name: string }
interface Coach { id: string; fullName: string; role: string }
interface Skill { id: string; name: string; sportName: string }
interface Belt { id: string; name: string; color: string | null; isActive?: boolean }
interface WeightLog { id: string; weightKg: number; date: string }
interface NutritionPlan { id: string; title: string; content: string; createdAt: string }
interface TrainingPlan { id: string; title: string; content: string; eventDate: string | null; createdAt: string }
interface CurrentRating { skillId: string; skillName: string; sportName: string; value: number; date: string }

const sectionTitle = {
  color: '#d4af37', fontSize: 17, fontWeight: 900, margin: '0 0 16px',
  paddingBottom: 10, borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
}

const rowStyle = {
  display: 'flex', justifyContent: 'space-between' as const, alignItems: 'center' as const,
  background: 'rgba(15,23,42,0.5)', borderRadius: 8, padding: '10px 14px', marginBottom: 8,
}

const smallBtn = { border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }

export default function EditPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.playerId as string

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [allSports, setAllSports] = useState<Sport[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillsError, setSkillsError] = useState('')
  const [belts, setBelts] = useState<Belt[]>([])
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([])
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([])
  const [currentRatings, setCurrentRatings] = useState<CurrentRating[]>([])

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [hasAccount, setHasAccount] = useState(false)
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
  const [medicalCheckExpiry, setMedicalCheckExpiry] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [coachId, setCoachId] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentBelt, setCurrentBelt] = useState('')
  const [targetBelt, setTargetBelt] = useState('')

  const [originalData, setOriginalData] = useState({ currentBelt: '', targetBelt: '', avatarUrl: '' })

  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([])
  const [skillRatings, setSkillRatings] = useState<Record<string, string>>({})

  const [selectedSubscriptionSportId, setSelectedSubscriptionSportId] = useState('')
  const [subSessions, setSubSessions] = useState('')

  const [weightSportId, setWeightSportId] = useState('')
  const [newWeight, setNewWeight] = useState('')
  const [addingWeight, setAddingWeight] = useState(false)
  const [weightMsg, setWeightMsg] = useState('')

  const [npTitle, setNpTitle] = useState('')
  const [npContent, setNpContent] = useState('')
  const [addingNp, setAddingNp] = useState(false)
  const [npMsg, setNpMsg] = useState('')

  const [tpTitle, setTpTitle] = useState('')
  const [tpContent, setTpContent] = useState('')
  const [tpEventDate, setTpEventDate] = useState('')
  const [addingTp, setAddingTp] = useState(false)
  const [tpMsg, setTpMsg] = useState('')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function loadNutritionPlans() {
    const { ok, data, error } = await safeFetchJson<{ plans: NutritionPlan[] }>(`/api/nutrition-plans?playerId=${playerId}`)
    if (ok && data) { setNutritionPlans(data.plans || []); setNpMsg('') }
    else if (error) setNpMsg(error)
  }

  async function loadTrainingPlans() {
    const { ok, data, error } = await safeFetchJson<{ plans: TrainingPlan[] }>(`/api/training-plans?playerId=${playerId}`)
    if (ok && data) { setTrainingPlans(data.plans || []); setTpMsg('') }
    else if (error) setTpMsg(error)
  }

  async function loadCurrentRatings() {
    const { ok, data } = await safeFetchJson<{ ratings: CurrentRating[] }>(`/api/admin/player-skill-ratings?playerId=${playerId}`)
    if (ok && data) setCurrentRatings(data.ratings || [])
  }

  useEffect(() => {
    let isMounted = true
    if (!playerId) return

    async function loadAll() {
      const [detailsResult, beltsResult] = await Promise.all([
        safeFetchJson<{
          player: {
            fullName: string; phone: string | null; email: string | null; userId: string | null; birthDate: string | null; sportsBackground: string | null
            medicalCheckExpiry: string | null; joinDate: string | null; coachId: string | null
            avatarUrl: string | null; currentBelt: string | null; targetBelt: string | null
          }
          allSports: Sport[]; coaches: Coach[]; playerSportIds: string[]; weightLogs: WeightLog[]
        }>(`/api/admin/player-details?playerId=${playerId}`),
        safeFetchJson<{ belts: (Belt & { isActive: boolean })[] }>('/api/admin/belts-list'),
      ])

      if (!isMounted) return

      if (!detailsResult.ok || !detailsResult.data?.player) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const data = detailsResult.data
      setFullName(data.player.fullName)
      setPhone(data.player.phone || '')
      setEmail(data.player.email || '')
      setHasAccount(!!data.player.userId || !!data.player.email)
      setBirthDate(data.player.birthDate ? data.player.birthDate.split('T')[0] : '')
      setSportsBackground(data.player.sportsBackground || '')
      setMedicalCheckExpiry(data.player.medicalCheckExpiry ? data.player.medicalCheckExpiry.split('T')[0] : '')
      setJoinDate(data.player.joinDate ? data.player.joinDate.split('T')[0] : '')
      setCoachId(data.player.coachId || '')
      
      const loadedAvatar = data.player.avatarUrl || ''
      const loadedCurrentBelt = data.player.currentBelt || ''
      const loadedTargetBelt = data.player.targetBelt || ''

      setAvatarUrl(loadedAvatar)
      setCurrentBelt(loadedCurrentBelt)
      setTargetBelt(loadedTargetBelt)

      setOriginalData({
        currentBelt: loadedCurrentBelt,
        targetBelt: loadedTargetBelt,
        avatarUrl: loadedAvatar,
      })

      setAllSports(data.allSports || [])
      setCoaches(data.coaches || [])
      setSelectedSportIds(data.playerSportIds || [])
      setWeightLogs((data.weightLogs || []).filter(Boolean))

      if (data.playerSportIds && data.playerSportIds.length > 0) {
        setWeightSportId(data.playerSportIds[0])
      }

      if (beltsResult.ok && beltsResult.data) {
        setBelts(beltsResult.data.belts.filter((b) => b.isActive))
      }

      setLoading(false)
    }

    loadAll()
    loadNutritionPlans()
    loadTrainingPlans()
    loadCurrentRatings()

    return () => { isMounted = false }
  }, [playerId])

  useEffect(() => {
    let isMounted = true
    setSkillsError('')
    if (selectedSportIds.length === 0) { setSkills([]); return }

    async function loadSkills() {
      const results = await Promise.all(
        selectedSportIds.map((sId) => safeFetchJson<{ skills: { id: string; name: string }[] }>(`/api/admin/skills?sportId=${sId}`))
      )
      if (!isMounted) return

      const merged: Skill[] = []
      let hadError = false
      results.forEach((res, i) => {
        if (!res.ok) { hadError = true; return }
        const sportName = allSports.find((sp) => sp.id === selectedSportIds[i])?.name || ''
        const sportSkills = (res.data?.skills || []).map((sk) => ({ id: sk.id, name: sk.name, sportName }))
        merged.push(...sportSkills)
      })
      setSkills(merged)
      if (hadError) setSkillsError('حدث خطأ أثناء تحميل المهارات، تأكد من إعادة تشغيل السيرفر')
    }

    loadSkills()
    return () => { isMounted = false }
  }, [selectedSportIds, allSports])

  function toggleSport(sportId: string) {
    setSelectedSportIds((prev) => (prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('player-avatars').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('player-avatars').getPublicUrl(fileName)
      setAvatarUrl(data.publicUrl)
      setMessage('تم رفع الصورة بنجاح!')
    } catch (error) {
      console.error(error)
      setMessage('حدث خطأ أثناء رفع الصورة.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault()
    if (!newWeight || !weightSportId) {
      setWeightMsg('اختر الرياضة وأدخل الوزن')
      return
    }
    setAddingWeight(true)
    setWeightMsg('')

    const { ok, data, error } = await safeFetchJson<{ log: WeightLog }>('/api/admin/manage-weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId: weightSportId, weightKg: newWeight }),
    })

    setAddingWeight(false)

    if (ok && data?.log) {
      setWeightLogs((prev) => [data.log, ...prev])
      setNewWeight('')
      setWeightMsg('✅ تم الحفظ')
    } else {
      setWeightMsg(error || 'حدث خطأ أثناء الحفظ')
    }
  }

  async function handleAddNutritionPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!npTitle || !npContent) return
    setAddingNp(true)
    setNpMsg('')

    const { ok, error } = await safeFetchJson('/api/nutrition-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, title: npTitle, content: npContent }),
    })

    setAddingNp(false)

    if (ok) {
      setNpTitle('')
      setNpContent('')
      loadNutritionPlans()
    } else {
      setNpMsg(error || 'حدث خطأ أثناء الحفظ')
    }
  }

  async function handleDeleteNutritionPlan(id: string) {
    if (!confirm('حذف هذا البرنامج؟')) return
    await safeFetchJson(`/api/nutrition-plans?id=${id}`, { method: 'DELETE' })
    loadNutritionPlans()
  }

  async function handleAddTrainingPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!tpTitle || !tpContent) return
    setAddingTp(true)
    setTpMsg('')

    const { ok, error } = await safeFetchJson('/api/training-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, title: tpTitle, content: tpContent, eventDate: tpEventDate || null }),
    })

    setAddingTp(false)

    if (ok) {
      setTpTitle('')
      setTpContent('')
      setTpEventDate('')
      loadTrainingPlans()
    } else {
      setTpMsg(error || 'حدث خطأ أثناء الحفظ')
    }
  }

  async function handleDeleteTrainingPlan(id: string) {
    if (!confirm('حذف هذا البرنامج؟')) return
    await safeFetchJson(`/api/training-plans?id=${id}`, { method: 'DELETE' })
    loadTrainingPlans()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const newSubscription = subSessions
      ? { sportId: selectedSubscriptionSportId || null, totalSessions: Number(subSessions) }
      : null

    const { ok, error } = await safeFetchJson('/api/admin/edit-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId, fullName, phone, email, birthDate, sportsBackground, medicalCheckExpiry,
        joinDate, coachId, newPassword: newPassword || undefined,
        sportIds: selectedSportIds, 
        avatarUrl: avatarUrl || originalData.avatarUrl, 
        currentBelt: currentBelt || originalData.currentBelt, 
        targetBelt: targetBelt || originalData.targetBelt,
        newSubscription, skillRatings,
      }),
    })

    setSaving(false)

    if (!ok) {
      setMessage(error || 'حدثت مشكلة أثناء حفظ التعديلات')
      return
    }

    setMessage('تم حفظ التعديلات بنجاح ✅')
    if (email) setHasAccount(true)
    setNewPassword('')
    setSkillRatings({})
    loadCurrentRatings()
  }

  async function handleDeletePlayer() {
    if (!confirm(`هل أنت متأكد من حذف اللاعب "${fullName}" نهائيًا؟ لا يمكن التراجع.`)) return
    const { ok } = await safeFetchJson('/api/admin/edit-player', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    })
    if (ok) {
      router.push('/dashboard')
    } else {
      setMessage('حدث خطأ أثناء الحذف')
    }
  }

  if (loading) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>
  if (notFound) return <AdminShell fullName=""><div style={s.page}><p style={s.error}>اللاعب غير موجود</p></div></AdminShell>

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>تعديل بيانات اللاعب</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>{fullName}</p>
          </div>
          <button onClick={handleDeletePlayer} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>
            🗑️ حذف اللاعب نهائيًا
          </button>
        </div>

        {message && <p style={{ color: message.includes('✅') ? '#22c55e' : '#ef4444', fontWeight: 700, marginBottom: 16 }}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📝 البيانات الأساسية وتجهيز الحساب</h3>
            <label style={s.label}>الاسم الكامل *<input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={s.input} required /></label>
            <label style={s.label}>رقم الموبايل<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} /></label>
            
            <label style={s.label}>
              البريد الإلكتروني (اختياري لإنشاء حساب للاعب)
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={s.input} 
                disabled={hasAccount}
                placeholder={hasAccount ? "يمتلك اللاعب حساباً بالفعل" : "example@domain.com"}
              />
            </label>

            <label style={s.label}>
              كلمة المرور (اختياري)
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={s.input} 
                minLength={6} 
                placeholder={hasAccount ? "أدخل كلمة مرور جديدة للتغيير" : "تعيين كلمة مرور للحساب الجديد (6 أحرف على الأقل)"}
              />
            </label>

            <label style={s.label}>تاريخ الميلاد<input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={s.input} /></label>
            <label style={s.label}>الخلفية الرياضية<input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={s.input} /></label>
            <label style={s.label}>تاريخ الانضمام<input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} style={s.input} /></label>
            <label style={s.label}>تاريخ انتهاء الكشف الطبي<input type="date" value={medicalCheckExpiry} onChange={(e) => setMedicalCheckExpiry(e.target.value)} style={s.input} /></label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🥋 الصورة والأحزمة</h3>
            <label style={s.label}>صورة اللاعب (رفع جديدة لاستبدال الحالية)<input type="file" accept="image/*" onChange={handleImageUpload} style={s.input} /></label>
            {uploadingImage && <p style={{ color: '#d4af37', fontSize: 13 }}>جاري رفع الصورة...</p>}
            {avatarUrl && <img src={avatarUrl} alt="صورة اللاعب" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', marginTop: 8, border: '1px solid rgba(212,175,55,0.4)' }} />}

            <label style={s.label}>
              الحزام الحالي
              <select value={currentBelt} onChange={(e) => setCurrentBelt(e.target.value)} style={s.input}>
                <option value="">اختر الحزام الحالي</option>
                {belts.map((belt) => <option key={belt.id} value={belt.name}>{belt.name}</option>)}
              </select>
            </label>
            <label style={s.label}>
              الحزام المطلوب
              <select value={targetBelt} onChange={(e) => setTargetBelt(e.target.value)} style={s.input}>
                <option value="">اختر الحزام المطلوب</option>
                {belts.map((belt) => <option key={belt.id} value={belt.name}>{belt.name}</option>)}
              </select>
            </label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🏋️ المدرب والأنشطة</h3>
            <label style={s.label}>
              المدرب المسؤول
              <select value={coachId} onChange={(e) => setCoachId(e.target.value)} style={s.input}>
                <option value="">بدون مدرب</option>
                {coaches.map((c) => <option key={c.id} value={c.id}>{c.fullName} {c.role === 'ADMIN' ? '(آدمن)' : ''}</option>)}
              </select>
            </label>

            <label style={{ ...s.label, display: 'block', marginTop: 14 }}>الأنشطة المسجّل بها</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {allSports.map((sport) => (
                <label key={sport.id} style={{ ...s.checkboxLabel, background: selectedSportIds.includes(sport.id) ? 'rgba(212,175,55,0.15)' : s.checkboxLabel.background, border: selectedSportIds.includes(sport.id) ? '1px solid rgba(212,175,55,0.4)' : 'none' }}>
                  <input type="checkbox" checked={selectedSportIds.includes(sport.id)} onChange={() => toggleSport(sport.id)} style={s.checkbox} />
                  {sport.name}
                </label>
              ))}
            </div>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🎯 المهارات</h3>

            {skillsError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{skillsError}</p>}

            {currentRatings.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>التقييمات الحالية:</p>
                {currentRatings.map((r) => (
                  <div key={r.skillId} style={rowStyle}>
                    <span style={{ color: '#e2e8f0', fontSize: 13.5 }}>{r.skillName} <span style={{ color: '#64748b', fontSize: 11.5 }}>({r.sportName})</span></span>
                    <span style={{ color: '#d4af37', fontWeight: 800 }}>{r.value}%</span>
                  </div>
                ))}
              </div>
            )}

            {skills.length > 0 ? (
              <>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>إضافة تقييم جديد (سيتم حفظه عند الضغط على &quot;حفظ التعديلات&quot;):</p>
                {skills.map((skill) => (
                  <label key={skill.id} style={s.label}>
                    {skill.name} <span style={{ color: '#94a3b8', fontSize: 12 }}>({skill.sportName})</span>
                    <input type="number" min={0} max={100} placeholder="التقييم من 0 إلى 100" value={skillRatings[skill.id] || ''} onChange={(e) => setSkillRatings((prev) => ({ ...prev, [skill.id]: e.target.value }))} style={s.input} />
                  </label>
                ))}
              </>
            ) : (
              !skillsError && (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>
                  {selectedSportIds.length === 0
                    ? 'اختر رياضة للاعب من قسم "الأنشطة" أعلاه لتظهر مهاراتها هنا.'
                    : 'الرياضة مختارة، لكن لا توجد مهارات مضافة لها بعد.'}
                </p>
              )
            )}
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>💰 إضافة اشتراك جديد (اختياري)</h3>
            <p style={{ color: '#94a3b8', fontSize: 12.5, marginTop: -6, marginBottom: 16 }}>
              📅 تاريخ انتهاء الاشتراك يحسب تلقائيًا حسب عدد أيام تدريب المدرب أسبوعيًا
            </p>
            <label style={s.label}>
              النشاط التابع له الاشتراك
              <select value={selectedSubscriptionSportId} onChange={(e) => setSelectedSubscriptionSportId(e.target.value)} style={s.input}>
                <option value="">اختر النشاط</option>
                {allSports.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
              </select>
            </label>
            <label style={s.label}>عدد الجلسات<input type="number" min={1} value={subSessions} onChange={(e) => setSubSessions(e.target.value)} style={s.input} /></label>
          </div>

          <button type="submit" disabled={saving || uploadingImage} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>

        <div style={{ ...s.formCard, marginTop: 20, marginBottom: 20 }}>
          <h3 style={sectionTitle}>⚖️ تطور الوزن</h3>
          {weightLogs.filter(Boolean).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {weightLogs.filter(Boolean).map((w) => (
                <div key={w.id} style={rowStyle}>
                  <span style={{ color: '#e2e8f0' }}>{w.weightKg} كجم</span>
                  <span style={{ color: '#94a3b8', fontSize: 12.5 }}>{new Date(w.date).toLocaleDateString('ar-EG')}</span>
                </div>
              ))}
            </div>
          )}
          {weightMsg && <p style={{ color: weightMsg.includes('✅') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 10 }}>{weightMsg}</p>}
          <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            <select value={weightSportId} onChange={(e) => setWeightSportId(e.target.value)} style={{ ...s.input, margin: 0, flex: 1, minWidth: 140 }}>
              <option value="">اختر الرياضة</option>
              {allSports.filter((sp) => selectedSportIds.includes(sp.id)).map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
            <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} style={{ ...s.input, margin: 0, flex: 1, minWidth: 140 }} placeholder="الوزن بالكيلوجرام" />
            <button type="submit" disabled={addingWeight} className="btn-primary" style={{ ...s.button, width: 'auto', margin: 0, padding: '0 20px' }}>{addingWeight ? '...' : '+ إضافة'}</button>
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
          {npMsg && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{npMsg}</p>}
          <form onSubmit={handleAddNutritionPlan}>
            <label style={s.label}>عنوان البرنامج<input type="text" value={npTitle} onChange={(e) => setNpTitle(e.target.value)} style={s.input} placeholder="مثال: برنامج زيادة الكتلة العضلية" /></label>
            <label style={s.label}>تفاصيل البرنامج<textarea value={npContent} onChange={(e) => setNpContent(e.target.value)} style={{ ...s.input, minHeight: 120, resize: 'vertical' as const }} /></label>
            <button type="submit" disabled={addingNp} className="btn-primary" style={{ ...s.button, marginTop: 12 }}>{addingNp ? 'جارٍ الإضافة...' : '+ إضافة برنامج غذائي'}</button>
          </form>
        </div>

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={sectionTitle}>🏋️ برنامج تدريبي (قبل بطولة/معسكر)</h3>
          {trainingPlans.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {trainingPlans.map((tp) => (
                <div key={tp.id} style={{ ...rowStyle, flexDirection: 'column' as const, alignItems: 'flex-start' as const }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <strong style={{ color: '#f8fafc', fontSize: 14.5 }}>{tp.title}</strong>
                    <button type="button" onClick={() => handleDeleteTrainingPlan(tp.id)} style={{ ...smallBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>حذف</button>
                  </div>
                  {tp.eventDate && <span style={{ color: '#d4af37', fontSize: 12, marginTop: 4 }}>📅 موعد الحدث: {new Date(tp.eventDate).toLocaleDateString('ar-EG')}</span>}
                  <p style={{ color: '#94a3b8', fontSize: 13.5, margin: '6px 0 0', whiteSpace: 'pre-wrap' as const }}>{tp.content}</p>
                  <span style={{ color: '#64748b', fontSize: 11.5, marginTop: 6 }}>{new Date(tp.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              ))}
            </div>
          )}
          {tpMsg && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{tpMsg}</p>}
          <form onSubmit={handleAddTrainingPlan}>
            <label style={s.label}>عنوان البرنامج<input type="text" value={tpTitle} onChange={(e) => setTpTitle(e.target.value)} style={s.input} placeholder="مثال: تجهيز لبطولة الجمهورية" /></label>
            <label style={s.label}>موعد البطولة/المعسكر (اختياري)<input type="date" value={tpEventDate} onChange={(e) => setTpEventDate(e.target.value)} style={s.input} /></label>
            <label style={s.label}>تفاصيل البرنامج التدريبي<textarea value={tpContent} onChange={(e) => setTpContent(e.target.value)} style={{ ...s.input, minHeight: 120, resize: 'vertical' as const }} /></label>
            <button type="submit" disabled={addingTp} className="btn-primary" style={{ ...s.button, marginTop: 12 }}>{addingTp ? 'جارٍ الإضافة...' : '+ إضافة برنامج تدريبي'}</button>
          </form>
        </div>
      </div>
    </AdminShell>
  )
}