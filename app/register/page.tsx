'use client'

import { useState } from 'react'
import Link from 'next/link'

const governorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية',
  'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'بني سويف',
  'الفيوم', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
  'البحر الأحمر', 'الوادي الجديد', 'مطروح',
]

const sportsList = ['كونغ فو ساندا', 'كيك بوكسينج', 'مواي تاي', 'MMA', 'الجمباز']
const levels = ['مبتدئ', 'متوسط', 'متقدم', 'محترف']

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  marginBottom: 16,
  fontSize: 15,
  fontFamily: "'Tajawal', sans-serif",
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: 10,
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f1f5f9',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  display: 'block',
  color: '#cbd5e1',
  fontWeight: 700,
  fontSize: 14,
  marginBottom: 6,
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [sport, setSport] = useState('')
  const [level, setLevel] = useState('')
  const [hasCompeted, setHasCompeted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, age, phone, governorate, sport, level, hasCompeted, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدثت مشكلة، حاول مرة أخرى')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('حدثت مشكلة في الاتصال، حاول مرة أخرى')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 30% 20%, #1e293b 0%, #0f172a 60%, #020617 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: "'Tajawal', sans-serif",
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
          <h1 style={{ color: '#f8fafc', fontSize: 26, fontWeight: 900, marginBottom: 14 }}>
            تم استلام طلبك بنجاح
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8, marginBottom: 30 }}>
            سيراجع فريق الأكاديمية طلبك، وبمجرد الموافقة ستتمكن من تسجيل الدخول بالبريد الإلكتروني وكلمة المرور التي أدخلتهما.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: '#d4af37',
              color: '#0f172a',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: 800,
            }}
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 30% 20%, #1e293b 0%, #0f172a 60%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: 20,
          padding: '36px 30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🥋</div>
          <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 900, margin: 0 }}>سجّل في الأكاديمية</h1>
          <p style={{ color: '#94a3b8', fontSize: 13.5, marginTop: 6 }}>املأ البيانات وسنتواصل معك قريبًا</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>اسم اللاعب</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />

          <label style={labelStyle}>السن</label>
          <input type="number" min={3} max={80} value={age} onChange={(e) => setAge(e.target.value)} style={inputStyle} required />

          <label style={labelStyle}>رقم الهاتف</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} required />

          <label style={labelStyle}>المحافظة</label>
          <select value={governorate} onChange={(e) => setGovernorate(e.target.value)} style={inputStyle} required>
            <option value="">اختر المحافظة</option>
            {governorates.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <label style={labelStyle}>الرياضة المطلوبة</label>
          <select value={sport} onChange={(e) => setSport(e.target.value)} style={inputStyle} required>
            <option value="">اختر الرياضة</option>
            {sportsList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label style={labelStyle}>مستوى اللاعب</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={inputStyle} required>
            <option value="">اختر المستوى</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e2e8f0', fontSize: 14, marginBottom: 20, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasCompeted}
              onChange={(e) => setHasCompeted(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#d4af37' }}
            />
            هل سبق لك المشاركة في بطولات؟
          </label>

          <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: 16, marginBottom: 4 }}>
            <p style={{ color: '#d4af37', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
              🔐 بيانات حسابك (ستستخدمها لتسجيل الدخول بعد الموافقة)
            </p>
          </div>

          <label style={labelStyle}>البريد الإلكتروني</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />

          <label style={labelStyle}>كلمة المرور</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength={6} />

          <label style={labelStyle}>تأكيد كلمة المرور</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required minLength={6} />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Tajawal', sans-serif",
              background: '#d4af37',
              color: '#0f172a',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
          </button>

          {error && <p style={{ color: '#fca5a5', textAlign: 'center', marginTop: 14, fontSize: 14 }}>{error}</p>}
        </form>
      </div>
    </div>
  )
}