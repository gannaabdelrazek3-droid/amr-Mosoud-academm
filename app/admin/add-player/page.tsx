'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface Sport {
  id: string
  name: string
}

interface Coach {
  id: string
  fullName: string
}

export default function AddPlayerPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
  const [medicalCheckExpiry, setMedicalCheckExpiry] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [coachId, setCoachId] = useState('')
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([])

  // الحقول الجديدة للإضافة
  const [avatarUrl, setAvatarUrl] = useState('')
  const [currentBelt, setCurrentBelt] = useState('')
  const [targetBelt, setTargetBelt] = useState('')

  const [allSports, setAllSports] = useState<Sport[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/add-player')
      .then((res) => res.json())
      .then((data) => {
        setAllSports(data.sports || [])
        setCoaches(data.coaches || [])
      })
      .finally(() => setLoadingData(false))
  }, [])

  function toggleSport(sportId: string) {
    setSelectedSportIds((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!coachId) {
      setError('من فضلك اختر المدرب المسؤول')
      return
    }
    if (email && password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setSaving(true)
    const res = await fetch('/api/admin/add-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        phone,
        birthDate,
        sportsBackground,
        medicalCheckExpiry,
        joinDate,
        email,
        password,
        coachId,
        sportIds: selectedSportIds,
        avatarUrl,
        currentBelt,
        targetBelt,
      }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error || 'حدثت مشكلة، حاول مرة أخرى')
      return
    }

    router.push('/dashboard')
  }

  if (loadingData) {
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
            <p style={{ color: '#94a3b8', margin: 0 }}>أدخل بيانات اللاعب الجديد</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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
          </div>

          {/* قسم بيانات الصورة والأحزمة الجديد */}
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🥋 بيانات الصورة والأحزمة</h3>
            <label style={s.label}>
              رابط صورة اللاعب (Avatar URL)
              <input 
                type="text" 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)} 
                style={s.input} 
                placeholder="https://example.com/image.jpg" 
              />
            </label>

            <label style={s.label}>
              الحزام الحالي
              <select 
                value={currentBelt} 
                onChange={(e) => setCurrentBelt(e.target.value)} 
                style={s.input}
              >
                <option value="">اختر الحزام الحالي</option>
                <option value="أبيض">أبيض</option>
                <option value="أصفر">أصفر</option>
                <option value="برتقالي">برتقالي</option>
                <option value="أخضر">أخضر</option>
                <option value="أزرق">أزرق</option>
                <option value="بني">بني</option>
                <option value="أسود">أسود</option>
              </select>
            </label>

            <label style={s.label}>
              الحزام المطلوب
              <select 
                value={targetBelt} 
                onChange={(e) => setTargetBelt(e.target.value)} 
                style={s.input}
              >
                <option value="">اختر الحزام المطلوب</option>
                <option value="أبيض">أبيض</option>
                <option value="أصفر">أصفر</option>
                <option value="برتقالي">برتقالي</option>
                <option value="أخضر">أخضر</option>
                <option value="أزرق">أزرق</option>
                <option value="بني">بني</option>
                <option value="أسود">أسود</option>
              </select>
            </label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🏋️ المدرب المسؤول</h3>
            <label style={s.label}>
              اختر المدرب
              <select value={coachId} onChange={(e) => setCoachId(e.target.value)} style={s.input} required>
                <option value="">اختر المدرب</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🏅 الرياضات</h3>
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

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🔐 حساب الدخول (اختياري)</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
              لو أدخلت بريدًا إلكترونيًا وكلمة مرور، سيتمكن اللاعب من تسجيل الدخول فورًا. اتركهما فارغين لإضافة اللاعب بدون حساب دخول حاليًا.
            </p>
            <label style={s.label}>
              البريد الإلكتروني
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              كلمة المرور
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} minLength={6} />
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الإضافة...' : 'إضافة اللاعب'}
          </button>

          {error && <p style={s.error}>{error}</p>}
        </form>
      </div>
    </AdminShell>
  )
}