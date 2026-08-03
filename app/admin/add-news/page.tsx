'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default function AddNewsPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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
      const { error: uploadError } = await supabase.storage.from('news-images').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('news-images').getPublicUrl(fileName)
      setImageUrl(data.publicUrl)
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

    const res = await fetch('/api/admin/add-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        imageUrl,
        isActive,
        displayOrder: Number(displayOrder || 0),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء إضافة الخبر')
      return
    }

    router.push('/admin/news')
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
            <h1 style={s.title}>إضافة خبر جديد</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>يظهر في قسم "أحدث الأخبار" بالصفحة الرئيسية</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📰 بيانات الخبر</h3>
            <label style={s.label}>
              عنوان الخبر *
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              نص الخبر
              <textarea value={content} onChange={(e) => setContent(e.target.value)} style={{ ...s.input, minHeight: 100, resize: 'vertical' as const }} />
            </label>
            <label style={s.label}>
              صورة الخبر
              <input type="file" accept="image/*" onChange={handleImageUpload} style={s.input} />
            </label>
            {uploadingImage && <p style={{ color: '#d4af37', fontSize: 13, marginTop: 5 }}>جاري رفع الصورة...</p>}
            {imageUrl && (
              <div style={{ width: 160, height: 100, overflow: 'hidden', borderRadius: 8, marginTop: 8, border: '1px solid rgba(212,175,55,0.4)' }}>
                <img
                  src={imageUrl}
                  alt="خبر"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}
            <label style={s.label}>
              ترتيب الظهور (الأقل يظهر أولاً)
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} style={s.input} />
            </label>
            <label style={{ ...s.checkboxLabel, marginTop: 10 }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={s.checkbox} />
              نشط (يظهر في الصفحة الرئيسية)
            </label>
          </div>

          <button type="submit" disabled={saving || uploadingImage} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ ونشر الخبر'}
          </button>

          {message && <p style={{ ...s.error, marginTop: 15 }}>{message}</p>}
        </form>
      </div>
    </AdminShell>
  )
}