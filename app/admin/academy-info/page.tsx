'use client'

import { useState, useEffect } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

export default function AcademyInfoPage() {
  const [loading, setLoading] = useState(true)
  const [aboutText, setAboutText] = useState('')
  const [trainingSchedule, setTrainingSchedule] = useState('')
  const [activitiesText, setActivitiesText] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/academy-info')
      .then((res) => res.json())
      .then((data) => {
        const info = data.info
        if (info) {
          setAboutText(info.aboutText || '')
          setTrainingSchedule(info.trainingSchedule || '')
          setActivitiesText(info.activitiesText || '')
          setPhone(info.phone || '')
          setWhatsapp(info.whatsapp || '')
          setEmail(info.email || '')
          setAddress(info.address || '')
          setMapUrl(info.mapUrl || '')
          setFacebookUrl(info.facebookUrl || '')
          setInstagramUrl(info.instagramUrl || '')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/academy-info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aboutText,
        trainingSchedule,
        activitiesText,
        phone,
        whatsapp,
        email,
        address,
        mapUrl,
        facebookUrl,
        instagramUrl,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage(data.error || 'حدثت مشكلة أثناء الحفظ')
      return
    }

    setMessage('تم حفظ المعلومات بنجاح ✅')
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
            <h1 style={s.title}>معلومات الأكاديمية العامة</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>تظهر هذه البيانات في الصفحة الرئيسية للموقع</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📖 عن الأكاديمية</h3>
            <label style={s.label}>
              نبذة عن الأكاديمية
              <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} style={{ ...s.input, minHeight: 100, resize: 'vertical' as const }} />
            </label>
            <label style={s.label}>
              مواعيد التمرين
              <textarea value={trainingSchedule} onChange={(e) => setTrainingSchedule(e.target.value)} style={{ ...s.input, minHeight: 80, resize: 'vertical' as const }} placeholder="مثال: السبت والاثنين والأربعاء من 5 إلى 8 مساءً" />
            </label>
            <label style={s.label}>
              الأنشطة الموجودة
              <textarea value={activitiesText} onChange={(e) => setActivitiesText(e.target.value)} style={{ ...s.input, minHeight: 80, resize: 'vertical' as const }} placeholder="مثال: كونغ فو ساندا، كيك بوكسينج، مواي تاي، جمباز" />
            </label>
          </div>

          <div style={{ ...s.formCard, marginBottom: 20 }}>
            <h3 style={sectionTitle}>📞 بيانات التواصل والموقع</h3>
            <label style={s.label}>
              رقم الهاتف
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              رقم واتساب
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              البريد الإلكتروني
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              العنوان
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={s.input} />
            </label>
            <label style={s.label}>
              رابط خرائط جوجل (Google Maps embed)
              <input type="text" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} style={s.input} placeholder="رابط تضمين الخريطة" />
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

          <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ المعلومات'}
          </button>

          {message && <p style={{ color: '#22c55e', marginTop: 15, fontWeight: 700 }}>{message}</p>}
        </form>
      </div>
    </AdminShell>
  )
}