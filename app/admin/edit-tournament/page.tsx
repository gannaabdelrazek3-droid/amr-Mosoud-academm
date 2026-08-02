'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface MediaItem {
  id?: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption: string
}

interface Participant {
  id?: string
  name: string
  result: string
}

function EditTournamentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tournamentId = searchParams.get('id') || ''

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const [media, setMedia] = useState<MediaItem[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!tournamentId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    fetch(`/api/admin/edit-tournament?id=${tournamentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.tournament) {
          setNotFound(true)
          return
        }
        const t = data.tournament
        setName(t.name || '')
        setDate(t.date ? new Date(t.date).toISOString().slice(0, 10) : '')
        setLocation(t.location || '')
        setDescription(t.description || '')
        setDisplayOrder(t.displayOrder?.toString() || '0')
        setIsActive(t.isActive ?? true)
        setMedia(
          (t.media || []).map((m: { id: string; type: 'IMAGE' | 'VIDEO'; url: string; caption: string | null }) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            caption: m.caption || '',
          }))
        )
        setParticipants(
          (t.participants || []).map((p: { id: string; name: string; result: string | null }) => ({
            id: p.id,
            name: p.name,
            result: p.result || '',
          }))
        )
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [tournamentId])

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingIdx(idx)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('tournament-media').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('tournament-media').getPublicUrl(fileName)
      setMedia((prev) => prev.map((m, i) => (i === idx ? { ...m, url: data.publicUrl } : m)))
    } catch (error) {
      console.error(error)
      setMessage('حدث خطأ أثناء رفع الملف.')
    } finally {
      setUploadingIdx(null)
    }
  }

  function addMedia() {
    setMedia((prev) => [...prev, { type: 'IMAGE', url: '', caption: '' }])
  }
  function updateMedia(idx: number, field: keyof MediaItem, value: string) {
    setMedia((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)))
  }
  function removeMedia(idx: number) {
    setMedia((prev) => prev.filter((_, i) => i !== idx))
  }

  function addParticipant() {
    setParticipants((prev) => [...prev, { name: '', result: '' }])
  }
  function updateParticipant(idx: number, field: keyof Participant, value: string) {
    setParticipants((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))
  }
  function removeParticipant(idx: number) {
    setParticipants((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/edit-tournament', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: tournamentId,
        name,
        date,
        location,
        description,
        isActive,
        displayOrder: Number(displayOrder || 0),
        media: media.filter((m) => m.url.trim()),
        participants: participants.filter((p) => p.name.trim()),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء تعديل البطولة')
      return
    }

    router.push('/admin/tournaments')
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
          <p style={s.error}>البطولة غير موجودة</p>
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
            <h1 style={s.title}>تعديل بيانات البطولة</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>{name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📝 بيانات البطولة</h3>
            <label style={s.label}>
              اسم البطولة *
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              تاريخ البطولة *
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={s.input} required />
            </label>
            <label style={s.label}>
              مكان البطولة
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              وصف البطولة
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...s.input, minHeight: 90, resize: 'vertical' as const }} />
            </label>
            <label style={s.label}>
              ترتيب الظهور (الأقل يظهر أولاً)
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} style={s.input} />
            </label>
            <label style={{ ...s.checkboxLabel, marginTop: 10 }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={s.checkbox} />
              نشطة (تظهر في صفحة البطولات العامة)
            </label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📸 صور وفيديوهات البطولة</h3>
            {media.map((m, idx) => (
              <div key={idx} style={rowCard}>
                <label style={s.label}>
                  النوع
                  <select value={m.type} onChange={(e) => updateMedia(idx, 'type', e.target.value)} style={s.input}>
                    <option value="IMAGE">صورة</option>
                    <option value="VIDEO">فيديو</option>
                  </select>
                </label>
                {m.type === 'IMAGE' ? (
                  <>
                    <label style={s.label}>
                      رفع صورة جديدة
                      <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, idx)} style={s.input} />
                    </label>
                    {uploadingIdx === idx && <p style={{ color: '#d4af37', fontSize: 13 }}>جاري الرفع...</p>}
                    {m.url && (
                      <img src={m.url} alt="معرض" style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', marginTop: 6 }} />
                    )}
                  </>
                ) : (
                  <>
                    <label style={s.label}>
                      رفع فيديو جديد من الجهاز
                      <input type="file" accept="video/*" onChange={(e) => handleMediaUpload(e, idx)} style={s.input} />
                    </label>
                    {uploadingIdx === idx && <p style={{ color: '#d4af37', fontSize: 13 }}>جاري الرفع...</p>}
                    <label style={s.label}>
                      أو ألصقي رابط فيديو (يوتيوب مثلاً)
                      <input type="text" value={m.url} onChange={(e) => updateMedia(idx, 'url', e.target.value)} style={s.input} />
                    </label>
                  </>
                )}
                <label style={s.label}>
                  وصف (اختياري)
                  <input type="text" value={m.caption} onChange={(e) => updateMedia(idx, 'caption', e.target.value)} style={s.input} />
                </label>
                <button type="button" onClick={() => removeMedia(idx)} style={removeBtn}>🗑️ حذف</button>
              </div>
            ))}
            <button type="button" onClick={addMedia} style={addBtn}>➕ إضافة صورة/فيديو</button>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🏅 اللاعبون المشاركون / الفائزون</h3>
            {participants.map((p, idx) => (
              <div key={idx} style={rowCard}>
                <label style={s.label}>
                  اسم اللاعب
                  <input type="text" value={p.name} onChange={(e) => updateParticipant(idx, 'name', e.target.value)} style={s.input} />
                </label>
                <label style={s.label}>
                  النتيجة / المركز
                  <input type="text" value={p.result} onChange={(e) => updateParticipant(idx, 'result', e.target.value)} style={s.input} />
                </label>
                <button type="button" onClick={() => removeParticipant(idx)} style={removeBtn}>🗑️ حذف</button>
              </div>
            ))}
            <button type="button" onClick={addParticipant} style={addBtn}>➕ إضافة لاعب</button>
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </button>

          {message && <p style={{ ...s.error, marginTop: 15 }}>{message}</p>}
        </form>
      </div>
    </AdminShell>
  )
}

export default function EditTournamentPage() {
  return (
    <Suspense fallback={<p style={{ color: '#e2e8f0', padding: 40 }}>جارٍ التحميل...</p>}>
      <EditTournamentContent />
    </Suspense>
  )
}