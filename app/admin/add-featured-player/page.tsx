'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default function AddFeaturedPlayerPage() {
  const router = useRouter()

  const [season, setSeason] = useState(new Date().getFullYear().toString())
  const [name, setName] = useState('')
  const [sport, setSport] = useState('')
  const [reason, setReason] = useState('')
  const [achievement, setAchievement] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const [imageUrl, setImageUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('featured-player-avatars').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('featured-player-avatars').getPublicUrl(fileName)
      setImageUrl(data.publicUrl)
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

    const res = await fetch('/api/admin/add-featured-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        season: Number(season),
        name,
        imageUrl,
        sport,
        reason,
        achievement,
        isActive,
        displayOrder: Number(displayOrder || 0),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء إضافة اللاعب')
      return
    }

    router.push('/admin/featured-players')
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
            <h1 style={s.title}>إضافة لاعب مميز</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>يظهر في صفحة اللاعبين المميزين حسب الموسم</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📝 بيانات اللاعب</h3>
            <label style={s.label}>
              الموسم الرياضي (سنة) *
              <input type="number" value={season} onChange={(e) => setSeason(e.target.value)} style={s.input} required placeholder="مثال: 2025" />
            </label>
            <label style={s.label}>
              اسم اللاعب *
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              الرياضة
              <input type="text" value={sport} onChange={(e) => setSport(e.target.value)} style={s.input} placeholder="مثال: كيك بوكسينج" />
            </label>
            <label style={s.label}>
              سبب التميز
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} style={s.input} placeholder="مثال: الالتزام والتطور السريع" />
            </label>
            <label style={s.label}>
              الإنجاز
              <input type="text" value={achievement} onChange={(e) => setAchievement(e.target.value)} style={s.input} placeholder="مثال: المركز الأول - بطولة الجمهورية" />
            </label>
            <label style={s.label}>
              صورة اللاعب
              <input type="file" accept="image/*" onChange={handleImageUpload} style={s.input} />
            </label>
            {uploadingImage && <p style={{ color: '#d4af37', fontSize: 13, marginTop: 5 }}>جاري رفع الصورة...</p>}
            {imageUrl && (
              <img src={imageUrl} alt="اللاعب" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', marginTop: 8, border: '1px solid rgba(212,175,55,0.4)' }} />
            )}
            <label style={s.label}>
              ترتيب الظهور (الأقل يظهر أولاً)
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} style={s.input} />
            </label>
            <label style={{ ...s.checkboxLabel, marginTop: 10 }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={s.checkbox} />
              نشط (يظهر في الصفحة العامة)
            </label>
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