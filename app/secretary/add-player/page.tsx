'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const pageStyle = { background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px' }
const cardStyle = { maxWidth: 700, margin: '0 auto', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16, padding: 24 }
const inputStyle = { width: '100%', padding: '12px 14px', marginBottom: 14, fontSize: 15, fontFamily: "'Tajawal', sans-serif", border: '1px solid rgba(148,163,184,0.3)', borderRadius: 10, background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', boxSizing: 'border-box' as const }
const labelStyle = { display: 'block', color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 6 }
const buttonStyle = { width: '100%', padding: 14, fontSize: 16, fontWeight: 700, fontFamily: "'Tajawal', sans-serif", background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 10, cursor: 'pointer' }
const sectionTitle = { color: '#d4af37', fontSize: 16, fontWeight: 900, margin: '24px 0 14px', paddingBottom: 8, borderBottom: '1px solid rgba(212,175,55,0.2)' }

interface Sport { id: string; name: string }
interface Coach { id: string; fullName: string; role: string }

export default function SecretaryAddPlayerPage() {
  const router = useRouter()
  const [allSports, setAllSports] = useState<Sport[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [coachId, setCoachId] = useState('')
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // بيانات الاشتراك
  const [subSportId, setSubSportId] = useState('')
  const [subSessions, setSubSessions] = useState('')
  const [subEndDate, setSubEndDate] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [paidAmount, setPaidAmount] = useState('')

  const remainingAmount = Math.max(0, Number(totalAmount || 0) - Number(paidAmount || 0))

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/add-player')
      .then((res) => res.json())
      .then((data) => {
        if (data.allSports) setAllSports(data.allSports)
        if (data.coaches) setCoaches(data.coaches)
      })
      .finally(() => setLoading(false))
  }, [])

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

    const newSubscription =
      subSessions && subEndDate
        ? {
            sportId: subSportId || null,
            totalSessions: Number(subSessions),
            sessionsPerWeek: null,
            endDate: subEndDate,
            totalAmount: Number(totalAmount || 0),
            paidAmount: Number(paidAmount || 0),
            remainingAmount,
          }
        : null

    const res = await fetch('/api/admin/add-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone, birthDate, joinDate, coachId, sportIds: selectedSportIds, avatarUrl, newSubscription }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء إضافة اللاعب')
      return
    }

    router.push('/secretary')
  }

  if (loading) return <div style={pageStyle}><p style={{ color: '#e2e8f0', textAlign: 'center' }}>جارٍ التحميل...</p></div>

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: '#f8fafc', marginBottom: 6 }}>➕ إضافة لاعب جديد</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>تسجيل لاعب جديد في الأكاديمية</p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>الاسم الكامل *</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />

          <label style={labelStyle}>رقم الموبايل</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>تاريخ الميلاد</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>تاريخ الانضمام *</label>
          <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} style={inputStyle} required />

          <label style={labelStyle}>صورة اللاعب</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={inputStyle} />
          {uploadingImage && <p style={{ color: '#d4af37', fontSize: 13 }}>جاري رفع الصورة...</p>}

          <label style={labelStyle}>المدرب المسؤول</label>
          <select value={coachId} onChange={(e) => setCoachId(e.target.value)} style={inputStyle}>
            <option value="">بدون مدرب</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>

          <label style={labelStyle}>الأنشطة المسجّل بها</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            {allSports.map((sport) => (
              <label key={sport.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: selectedSportIds.includes(sport.id) ? 'rgba(212,175,55,0.15)' : 'rgba(15,23,42,0.5)', padding: '8px 14px', borderRadius: 8, color: '#e2e8f0', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedSportIds.includes(sport.id)} onChange={() => toggleSport(sport.id)} />
                {sport.name}
              </label>
            ))}
          </div>

          <h3 style={sectionTitle}>💰 الاشتراك (اختياري)</h3>

          <label style={labelStyle}>النشاط التابع له الاشتراك</label>
          <select value={subSportId} onChange={(e) => setSubSportId(e.target.value)} style={inputStyle}>
            <option value="">اختر النشاط</option>
            {allSports.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>

          <label style={labelStyle}>إجمالي عدد الحصص</label>
          <input type="number" min={1} value={subSessions} onChange={(e) => setSubSessions(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>تاريخ انتهاء الاشتراك</label>
          <input type="date" value={subEndDate} onChange={(e) => setSubEndDate(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>قيمة الاشتراك الكاملة (جنيه)</label>
          <input type="number" min={0} step="0.5" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>المبلغ المدفوع الآن (جنيه)</label>
          <input type="number" min={0} step="0.5" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} style={inputStyle} />

          {totalAmount && paidAmount && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: remainingAmount > 0 ? 'rgba(212,175,55,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${remainingAmount > 0 ? 'rgba(212,175,55,0.35)' : 'rgba(34,197,94,0.35)'}`, borderRadius: 8 }}>
              <span style={{ color: remainingAmount > 0 ? '#d4af37' : '#22c55e', fontWeight: 700, fontSize: 13.5 }}>
                {remainingAmount > 0 ? `متبقي على اللاعب: ${remainingAmount.toFixed(2)} جنيه` : 'الاشتراك مدفوع بالكامل ✅'}
              </span>
            </div>
          )}

          <button type="submit" disabled={saving || uploadingImage} style={buttonStyle}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ وإضافة اللاعب'}
          </button>

          {message && <p style={{ color: '#fca5a5', textAlign: 'center', marginTop: 14 }}>{message}</p>}
        </form>
      </div>
    </div>
  )
}