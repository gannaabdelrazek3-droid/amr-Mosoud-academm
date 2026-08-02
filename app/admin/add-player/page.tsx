'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'
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

export default function AddPlayerPage() {
  const router = useRouter()

  const [allSports, setAllSports] = useState<Sport[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  // البيانات الأساسية (بدون إجبار الإيميل والباسورد + إضافة رقم الموبايل وكود اللاعب)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [playerCode, setPlayerCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
  const [medicalCheckExpiry, setMedicalCheckExpiry] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [coachId, setCoachId] = useState('')
  
  // الصورة والأحزمة (محدثة: حذف الأبيض، إضافة الأسود دان وناشئين)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentBelt, setCurrentBelt] = useState('')
  const [targetBelt, setTargetBelt] = useState('')

  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([])
  const [skillRatings, setSkillRatings] = useState<Record<string, string>>({})

  // الاشتراكات التلقائية ونظام الإيرادات والمدفوعات
  const [selectedSubscriptionSportId, setSelectedSubscriptionSportId] = useState('')
  const [subSessions, setSubSessions] = useState('')
  const [sessionsPerWeek, setSessionsPerWeek] = useState('')
  const [subEndDate, setSubEndDate] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [paidAmount, setPaidAmount] = useState('')

  // حساب المتبقي تلقائياً
  const remainingAmount = Number(totalAmount || 0) - Number(paidAmount || 0)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/add-player-init')
      .then((res) => res.json())
      .then((data) => {
        if (data.allSports) setAllSports(data.allSports)
        if (data.coaches) setCoaches(data.coaches)
      })
      .finally(() => setLoading(false))
  }, [])

  // جلب المهارات الخاصة بالرياضات المحددة
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // تجهيز بيانات الاشتراك التلقائي والإيرادات
    const newSubscription =
      subSessions && subEndDate ? {
        sportId: selectedSubscriptionSportId || null,
        totalSessions: Number(subSessions),
        sessionsPerWeek: sessionsPerWeek ? Number(sessionsPerWeek) : null,
        endDate: subEndDate,
        totalAmount: Number(totalAmount || 0),
        paidAmount: Number(paidAmount || 0),
        remainingAmount: remainingAmount,
      } : null

    const res = await fetch('/api/admin/add-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        phone,
        playerCode,
        email,
        password,
        birthDate,
        sportsBackground,
        medicalCheckExpiry,
        joinDate,
        coachId,
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
      setMessage(data.error || 'حدثت مشكلة أثناء إضافة اللاعب')
      return
    }

    router.push('/dashboard')
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
            <h1 style={s.title}>إضافة لاعب جديد</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>تسجيل لاعب جديد في الأكاديمية بدون حساب إجباري</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* البيانات الأساسية */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📝 البيانات الأساسية وتسجيل الدخول</h3>
            <label style={s.label}>
              الاسم الكامل *
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              رقم الموبايل (لتسهيل تسجيل الدخول)
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              كود اللاعب (اختياري لتسجيل الدخول السريع)
              <input type="text" value={playerCode} onChange={(e) => setPlayerCode(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              البريد الإلكتروني (اختياري)
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              كلمة المرور (اختياري)
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} minLength={6} />
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
              تاريخ الاشتراك / الانضمام *
              <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              تاريخ انتهاء الكشف الطبي
              <input type="date" value={medicalCheckExpiry} onChange={(e) => setMedicalCheckExpiry(e.target.value)} style={s.input} />
            </label>
          </div>

          {/* صورة اللاعب والأحزمة المعدلة */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🥋 بيانات الصورة والأحزمة</h3>
            <label style={s.label}>
              صورة اللاعب (رفع ملف)
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload} 
                style={s.input} 
              />
            </label>
            {uploadingImage && <p style={{ color: '#d4af37', fontSize: 13, marginTop: 5 }}>جاري رفع الصورة...</p>}
            {avatarUrl && <p style={{ color: '#22c55e', fontSize: 13, marginTop: 5, wordBreak: 'break-all' }}>تم الرفع بنجاح: {avatarUrl}</p>}

            <label style={s.label}>
              الحزام الحالي
              <select value={currentBelt} onChange={(e) => setCurrentBelt(e.target.value)} style={s.input}>
                <option value="">اختر الحزام الحالي</option>
                <option value="أصفر">أصفر</option>
                <option value="برتقالي">برتقالي</option>
                <option value="أخضر">أخضر</option>
                <option value="أزرق">أزرق</option>
                <option value="بني">بني</option>
                <option value="أسود دان">أسود (دان)</option>
                <option value="أسود ناشئين">أسود ناشئين</option>
              </select>
            </label>

            <label style={s.label}>
              الحزام المطلوب
              <select value={targetBelt} onChange={(e) => setTargetBelt(e.target.value)} style={s.input}>
                <option value="">اختر الحزام المطلوب</option>
                <option value="أصفر">أصفر</option>
                <option value="برتقالي">برتقالي</option>
                <option value="أخضر">أخضر</option>
                <option value="أزرق">أزرق</option>
                <option value="بني">بني</option>
                <option value="أسود دان">أسود (دان)</option>
                <option value="أسود ناشئين">أسود ناشئين</option>
              </select>
            </label>
          </div>

          {/* المدرب المسؤول */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🏋️ المدرب المسؤول</h3>
            <label style={s.label}>
              اختر المدرب
              <select value={coachId} onChange={(e) => setCoachId(e.target.value)} style={s.input}>
                <option value="">بدون مدرب</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </label>
          </div>

          {/* الرياضات المسجّل بها */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🏅 الأنشطة والرياضات المسجّل بها</h3>
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

          {/* التقييمات الأولية للمهارات */}
          {skills.length > 0 && (
            <div style={{ ...s.formCard, marginBottom: 20 }}>
              <h3 style={sectionTitle}>🎯 تقييم المهارات الأولية</h3>
              {skills.map((skill) => (
                <label key={skill.id} style={s.label}>
                  {skill.name} <span style={{ color: '#94a3b8', fontSize: 12 }}>({skill.sportName})</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="التقييم من 0 إلى 100"
                    value={skillRatings[skill.id] || ''}
                    onChange={(e) => setSkillRatings((prev) => ({ ...prev, [skill.id]: e.target.value }))}
                    style={s.input}
                  />
                </label>
              ))}
            </div>
          )}

          {/* نظام الاشتراكات التلقائية والإيرادات والمدفوعات */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>💰 الاشتراك والإيرادات (نظام تلقائي)</h3>
            
            <label style={s.label}>
              النشاط التابع له الاشتراك
              <select value={selectedSubscriptionSportId} onChange={(e) => setSelectedSubscriptionSportId(e.target.value)} style={s.input}>
                <option value="">اختر النشاط</option>
                {allSports.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </label>

            <label style={s.label}>
              عدد مرات التمرين أسبوعياً (للحساب التلقائي للجلسات)
              <input type="number" min={1} value={sessionsPerWeek} onChange={(e) => setSessionsPerWeek(e.target.value)} style={s.input} placeholder="مثال: 3 مرات أسبوعياً" />
            </label>

            <label style={s.label}>
              إجمالي عدد الجلسات
              <input type="number" min={1} value={subSessions} onChange={(e) => setSubSessions(e.target.value)} style={s.input} placeholder="مثال: 12 جلسة" />
            </label>

            <label style={s.label}>
              تاريخ انتهاء الاشتراك
              <input type="date" value={subEndDate} onChange={(e) => setSubEndDate(e.target.value)} style={s.input} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <label style={s.label}>
                قيمة الاشتراك الكاملة
                <input type="number" min={0} step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} style={s.input} placeholder="0.00" />
              </label>

              <label style={s.label}>
                المبلغ المدفوع (يسجل في الإيرادات)
                <input type="number" min={0} step="0.01" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} style={s.input} placeholder="0.00" />
              </label>
            </div>

            <div style={{ marginTop: 10, padding: 12, background: 'rgba(212,175,55,0.05)', borderRadius: 8, border: '1px solid rgba(212,175,55,0.2)' }}>
              <span style={{ color: '#d4af37', fontWeight: 'bold' }}>المبلغ المتبقي تلقائياً: </span>
              <span style={{ color: remainingAmount > 0 ? '#ef4444' : '#22c55e', fontWeight: 'bold', fontSize: 16 }}>
                {remainingAmount.toFixed(2)} ج.م
              </span>
            </div>
          </div>

          <button type="submit" disabled={saving || uploadingImage} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ وإضافة اللاعب'}
          </button>

          {message && <p style={{ ...s.error, marginTop: 15 }}>{message}</p>}
        </form>
      </div>
    </AdminShell>
  )
}