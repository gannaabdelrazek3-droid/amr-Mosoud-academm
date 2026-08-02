'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { adminStyles as s } from '@/app/admin/adminStyles'
import AdminShell from '@/app/admin/AdminShell'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface Sport {
  id: string
  name: string
}

interface Achievement {
  id?: string
  title: string
  year: string
}

interface Certificate {
  id?: string
  title: string
  imageUrl: string
}

interface GalleryItem {
  id?: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption: string
}

function EditCoachContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const coachId = searchParams.get('id') || ''

  const [allSports, setAllSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [playersTrained, setPlayersTrained] = useState('')
  const [belts, setBelts] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [trainingSchedule, setTrainingSchedule] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([])

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = useState<number | null>(null)
  const [uploadingCertIdx, setUploadingCertIdx] = useState<number | null>(null)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!coachId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    fetch(`/api/admin/edit-coach?id=${coachId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.coach) {
          setNotFound(true)
          return
        }
        const c = data.coach
        setAllSports(data.allSports || [])
        setFullName(c.fullName || '')
        setPhone(c.phone || '')
        setTitle(c.title || '')
        setBio(c.bio || '')
        setYearsExperience(c.yearsExperience?.toString() || '')
        setPlayersTrained(c.playersTrained?.toString() || '')
        setBelts(c.belts || '')
        setWhatsapp(c.whatsapp || '')
        setFacebookUrl(c.facebookUrl || '')
        setInstagramUrl(c.instagramUrl || '')
        setTrainingSchedule(c.trainingSchedule || '')
        setDisplayOrder(c.displayOrder?.toString() || '0')
        setIsActive(c.isActive ?? true)
        setAvatarUrl(c.avatarUrl || '')
        setSelectedSportIds((c.coachSports || []).map((cs: { sportId: string }) => cs.sportId))
        setAchievements(
          (c.achievements || []).map((a: { id: string; title: string; year: number | null }) => ({
            id: a.id,
            title: a.title,
            year: a.year?.toString() || '',
          }))
        )
        setCertificates(
          (c.certificates || []).map((cert: { id: string; title: string; imageUrl: string | null }) => ({
            id: cert.id,
            title: cert.title,
            imageUrl: cert.imageUrl || '',
          }))
        )
        setGallery(
          (c.galleryItems || []).map((g: { id: string; type: 'IMAGE' | 'VIDEO'; url: string; caption: string | null }) => ({
            id: g.id,
            type: g.type,
            url: g.url,
            caption: g.caption || '',
          }))
        )
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [coachId])

  function toggleSport(sportId: string) {
    setSelectedSportIds((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
    )
  }

  async function uploadFile(file: File, bucket: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file)
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      const url = await uploadFile(file, 'coach-avatars')
      setAvatarUrl(url)
      setMessage('تم رفع الصورة بنجاح!')
    } catch (error) {
      console.error(error)
      setMessage('حدث خطأ أثناء رفع الصورة.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleCertUpload(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingCertIdx(idx)
      const url = await uploadFile(file, 'coach-certificates')
      setCertificates((prev) => prev.map((c, i) => (i === idx ? { ...c, imageUrl: url } : c)))
    } catch (error) {
      console.error(error)
      setMessage('حدث خطأ أثناء رفع صورة الشهادة.')
    } finally {
      setUploadingCertIdx(null)
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingGalleryIdx(idx)
      const url = await uploadFile(file, 'coach-gallery')
      setGallery((prev) => prev.map((g, i) => (i === idx ? { ...g, url } : g)))
    } catch (error) {
      console.error(error)
      setMessage('حدث خطأ أثناء رفع الملف.')
    } finally {
      setUploadingGalleryIdx(null)
    }
  }

  function addAchievement() {
    setAchievements((prev) => [...prev, { title: '', year: '' }])
  }
  function updateAchievement(idx: number, field: keyof Achievement, value: string) {
    setAchievements((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)))
  }
  function removeAchievement(idx: number) {
    setAchievements((prev) => prev.filter((_, i) => i !== idx))
  }

  function addCertificate() {
    setCertificates((prev) => [...prev, { title: '', imageUrl: '' }])
  }
  function updateCertificate(idx: number, field: keyof Certificate, value: string) {
    setCertificates((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)))
  }
  function removeCertificate(idx: number) {
    setCertificates((prev) => prev.filter((_, i) => i !== idx))
  }

  function addGalleryItem() {
    setGallery((prev) => [...prev, { type: 'IMAGE', url: '', caption: '' }])
  }
  function updateGalleryItem(idx: number, field: keyof GalleryItem, value: string) {
    setGallery((prev) => prev.map((g, i) => (i === idx ? { ...g, [field]: value } : g)))
  }
  function removeGalleryItem(idx: number) {
    setGallery((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/edit-coach', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: coachId,
        fullName,
        phone,
        title,
        bio,
        yearsExperience: yearsExperience ? Number(yearsExperience) : null,
        playersTrained: playersTrained ? Number(playersTrained) : null,
        belts,
        avatarUrl,
        whatsapp,
        facebookUrl,
        instagramUrl,
        trainingSchedule,
        isActive,
        displayOrder: Number(displayOrder || 0),
        sportIds: selectedSportIds,
        achievements: achievements
          .filter((a) => a.title.trim())
          .map((a) => ({ title: a.title, year: a.year ? Number(a.year) : null })),
        certificates: certificates.filter((c) => c.title.trim()),
        gallery: gallery.filter((g) => g.url.trim()),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء تعديل بيانات المدرب')
      return
    }

    router.push('/admin/coaches')
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

  if (notFound) {
    return (
      <AdminShell fullName="">
        <div style={s.page}>
          <p style={s.error}>المدرب غير موجود</p>
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

  const rowCard = {
    background: 'rgba(212,175,55,0.05)',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    position: 'relative' as const,
  }

  const removeBtn = {
    background: 'rgba(239,68,68,0.15)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 6,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 13,
    marginTop: 8,
  }

  const addBtn = {
    background: 'rgba(212,175,55,0.15)',
    color: '#d4af37',
    border: '1px solid rgba(212,175,55,0.4)',
    borderRadius: 8,
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>تعديل بيانات المدرب</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>{fullName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📝 البيانات الأساسية</h3>
            <label style={s.label}>
              الاسم الكامل *
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              رقم الموبايل *
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              الوظيفة (مثال: مدرب ساندا - مدرب كيك بوكسينج)
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              نبذة عن المدرب
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...s.input, minHeight: 90, resize: 'vertical' as const }} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <label style={s.label}>
                سنوات الخبرة
                <input type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} style={s.input} />
              </label>
              <label style={s.label}>
                عدد اللاعبين الذين تم تدريبهم
                <input type="number" min={0} value={playersTrained} onChange={(e) => setPlayersTrained(e.target.value)} style={s.input} />
              </label>
            </div>
            <label style={s.label}>
              الأحزمة / الدرجات
              <input type="text" value={belts} onChange={(e) => setBelts(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              مواعيد التدريب
              <input type="text" value={trainingSchedule} onChange={(e) => setTrainingSchedule(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              ترتيب الظهور في الصفحة (الأقل يظهر أولاً)
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} style={s.input} />
            </label>
            <label style={{ ...s.checkboxLabel, marginTop: 10 }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={s.checkbox} />
              نشط (يظهر في صفحة المدربين العامة)
            </label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🖼️ الصورة الشخصية والتواصل</h3>
            <label style={s.label}>
              صورة المدرب (رفع ملف جديد لاستبدال الحالية)
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={s.input} />
            </label>
            {uploadingImage && <p style={{ color: '#d4af37', fontSize: 13, marginTop: 5 }}>جاري رفع الصورة...</p>}
            {avatarUrl && (
              <div style={{ marginTop: 10 }}>
                <img src={avatarUrl} alt="صورة المدرب" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(212,175,55,0.4)' }} />
              </div>
            )}

            <label style={s.label}>
              رقم واتساب
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              رابط فيسبوك
              <input type="text" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              رابط انستجرام
              <input type="text" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} style={s.input} />
            </label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🥋 الرياضات التي يدربها</h3>
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
            <h3 style={sectionTitle}>🏆 البطولات والإنجازات</h3>
            {achievements.map((a, idx) => (
              <div key={idx} style={rowCard}>
                <label style={s.label}>
                  اسم الإنجاز / البطولة
                  <input type="text" value={a.title} onChange={(e) => updateAchievement(idx, 'title', e.target.value)} style={s.input} />
                </label>
                <label style={s.label}>
                  السنة
                  <input type="number" value={a.year} onChange={(e) => updateAchievement(idx, 'year', e.target.value)} style={s.input} />
                </label>
                <button type="button" onClick={() => removeAchievement(idx)} style={removeBtn}>🗑️ حذف</button>
              </div>
            ))}
            <button type="button" onClick={addAchievement} style={addBtn}>➕ إضافة إنجاز</button>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📜 الشهادات</h3>
            {certificates.map((c, idx) => (
              <div key={idx} style={rowCard}>
                <label style={s.label}>
                  اسم الشهادة
                  <input type="text" value={c.title} onChange={(e) => updateCertificate(idx, 'title', e.target.value)} style={s.input} />
                </label>
                <label style={s.label}>
                  صورة الشهادة
                  <input type="file" accept="image/*" onChange={(e) => handleCertUpload(e, idx)} style={s.input} />
                </label>
                {uploadingCertIdx === idx && <p style={{ color: '#d4af37', fontSize: 13 }}>جاري الرفع...</p>}
                {c.imageUrl && (
                  <img src={c.imageUrl} alt="شهادة" style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', marginTop: 6 }} />
                )}
                <button type="button" onClick={() => removeCertificate(idx)} style={removeBtn}>🗑️ حذف</button>
              </div>
            ))}
            <button type="button" onClick={addCertificate} style={addBtn}>➕ إضافة شهادة</button>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📸 معرض الصور والفيديوهات</h3>
            {gallery.map((g, idx) => (
              <div key={idx} style={rowCard}>
                <label style={s.label}>
                  النوع
                  <select value={g.type} onChange={(e) => updateGalleryItem(idx, 'type', e.target.value)} style={s.input}>
                    <option value="IMAGE">صورة</option>
                    <option value="VIDEO">فيديو</option>
                  </select>
                </label>
                {g.type === 'IMAGE' ? (
                  <>
                    <label style={s.label}>
                      رفع صورة جديدة
                      <input type="file" accept="image/*" onChange={(e) => handleGalleryUpload(e, idx)} style={s.input} />
                    </label>
                    {uploadingGalleryIdx === idx && <p style={{ color: '#d4af37', fontSize: 13 }}>جاري الرفع...</p>}
                    {g.url && (
                      <img src={g.url} alt="معرض" style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', marginTop: 6 }} />
                    )}
                  </>
                ) : (
                  <label style={s.label}>
                    رابط الفيديو
                    <input type="text" value={g.url} onChange={(e) => updateGalleryItem(idx, 'url', e.target.value)} style={s.input} />
                  </label>
                )}
                <label style={s.label}>
                  وصف (اختياري)
                  <input type="text" value={g.caption} onChange={(e) => updateGalleryItem(idx, 'caption', e.target.value)} style={s.input} />
                </label>
                <button type="button" onClick={() => removeGalleryItem(idx)} style={removeBtn}>🗑️ حذف</button>
              </div>
            ))}
            <button type="button" onClick={addGalleryItem} style={addBtn}>➕ إضافة صورة/فيديو</button>
          </div>

          <button type="submit" disabled={saving || uploadingImage} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </button>

          {message && <p style={{ ...s.error, marginTop: 15 }}>{message}</p>}
        </form>
      </div>
    </AdminShell>
  )
}

export default function EditCoachPage() {
  return (
    <Suspense fallback={<p style={{ color: '#e2e8f0', padding: 40 }}>جارٍ التحميل...</p>}>
      <EditCoachContent />
    </Suspense>
  )
}