'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const categories = [
  { value: 'TOURNAMENTS', label: 'بطولات' },
  { value: 'TRAINING', label: 'تدريبات' },
  { value: 'BELT_TESTS', label: 'اختبارات أحزمة' },
  { value: 'CAMPS', label: 'معسكرات' },
  { value: 'PARTIES', label: 'حفلات' },
]

interface MediaItem {
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption: string
}

export default function AddAlbumPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('TOURNAMENTS')
  const [coverUrl, setCoverUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const [items, setItems] = useState<MediaItem[]>([])
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function uploadFile(file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('gallery-media').upload(fileName, file)
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('gallery-media').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingCover(true)
      const url = await uploadFile(file)
      setCoverUrl(url)
    } catch (error) {
      console.error(error)
      setMessage('حدث خطأ أثناء رفع صورة الغلاف.')
    } finally {
      setUploadingCover(false)
    }
  }

  async function handleItemUpload(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingIdx(idx)
      const url = await uploadFile(file)
      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, url } : it)))
    } catch (error) {
      console.error(error)
      setMessage('حدث خطأ أثناء رفع الملف.')
    } finally {
      setUploadingIdx(null)
    }
  }

  function addItem() {
    setItems((prev) => [...prev, { type: 'IMAGE', url: '', caption: '' }])
  }
  function updateItem(idx: number, field: keyof MediaItem, value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/add-album', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        category,
        coverUrl,
        isActive,
        displayOrder: Number(displayOrder || 0),
        items: items.filter((it) => it.url.trim()),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء إضافة الألبوم')
      return
    }

    router.push('/admin/albums')
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
            <h1 style={s.title}>إضافة ألبوم جديد</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>إنشاء ألبوم صور/فيديوهات ضمن أحد الأقسام</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📝 بيانات الألبوم</h3>
            <label style={s.label}>
              عنوان الألبوم *
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              القسم *
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.input}>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            <label style={s.label}>
              صورة الغلاف
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={s.input} />
            </label>
            {uploadingCover && <p style={{ color: '#d4af37', fontSize: 13 }}>جاري رفع الغلاف...</p>}
            {coverUrl && (
              <img src={coverUrl} alt="غلاف" style={{ width: 120, height: 90, borderRadius: 8, objectFit: 'cover', marginTop: 8, border: '1px solid rgba(212,175,55,0.4)' }} />
            )}
            <label style={s.label}>
              ترتيب الظهور (الأقل يظهر أولاً)
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} style={s.input} />
            </label>
            <label style={{ ...s.checkboxLabel, marginTop: 10 }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={s.checkbox} />
              نشط (يظهر في معرض الصور العام)
            </label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📸 محتوى الألبوم (صور وفيديوهات)</h3>
            {items.map((it, idx) => (
              <div key={idx} style={rowCard}>
                <label style={s.label}>
                  النوع
                  <select value={it.type} onChange={(e) => updateItem(idx, 'type', e.target.value)} style={s.input}>
                    <option value="IMAGE">صورة</option>
                    <option value="VIDEO">فيديو</option>
                  </select>
                </label>
                {it.type === 'IMAGE' ? (
                  <label style={s.label}>
                    رفع صورة
                    <input type="file" accept="image/*" onChange={(e) => handleItemUpload(e, idx)} style={s.input} />
                  </label>
                ) : (
                  <>
                    <label style={s.label}>
                      رفع فيديو من الجهاز
                      <input type="file" accept="video/*" onChange={(e) => handleItemUpload(e, idx)} style={s.input} />
                    </label>
                    <label style={s.label}>
                      أو ألصقي رابط فيديو (يوتيوب مثلاً)
                      <input type="text" value={it.url} onChange={(e) => updateItem(idx, 'url', e.target.value)} style={s.input} placeholder="اختياري لو رفعتِ ملف بالأعلى" />
                    </label>
                  </>
                )}
                {uploadingIdx === idx && <p style={{ color: '#d4af37', fontSize: 13 }}>جاري الرفع...</p>}
                {it.url && <p style={{ color: '#22c55e', fontSize: 13, wordBreak: 'break-all' as const }}>تم الرفع/الإضافة بنجاح</p>}
                <label style={s.label}>
                  وصف (اختياري)
                  <input type="text" value={it.caption} onChange={(e) => updateItem(idx, 'caption', e.target.value)} style={s.input} />
                </label>
                <button type="button" onClick={() => removeItem(idx)} style={removeBtn}>🗑️ حذف</button>
              </div>
            ))}
            <button type="button" onClick={addItem} style={addBtn}>➕ إضافة صورة/فيديو</button>
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ وإضافة الألبوم'}
          </button>

          {message && <p style={{ ...s.error, marginTop: 15 }}>{message}</p>}
        </form>
      </div>
    </AdminShell>
  )
}