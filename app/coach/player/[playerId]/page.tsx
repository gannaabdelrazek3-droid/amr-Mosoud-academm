'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { safeFetchJson } from '@/lib/safeFetch'

interface WeightLog { id: string; weightKg: number; date: string }
interface NutritionPlan { id: string; title: string; content: string; createdAt: string }
interface TrainingPlan { id: string; title: string; content: string; eventDate: string | null; createdAt: string }
interface Belt { id: string; name: string }
interface Sport { id: string; name: string }

const pageStyle = { background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px' }
const cardStyle = { maxWidth: 700, margin: '0 auto 20px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16, padding: 24 }
const sectionTitle = { color: '#d4af37', fontSize: 16, fontWeight: 900, margin: '0 0 14px', paddingBottom: 8, borderBottom: '1px solid rgba(212,175,55,0.2)' }
const labelStyle = { display: 'block', color: '#cbd5e1', fontWeight: 700, fontSize: 13, marginBottom: 6, marginTop: 12 }
const inputStyle = { width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: "'Tajawal', sans-serif", border: '1px solid rgba(148,163,184,0.3)', borderRadius: 8, background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', boxSizing: 'border-box' as const }
const buttonStyle = { padding: '10px 20px', background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" }
const rowStyle = { display: 'flex', justifyContent: 'space-between' as const, alignItems: 'center' as const, background: 'rgba(15,23,42,0.5)', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }
const smallBtn = { border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }

export default function CoachPlayerPage() {
  const params = useParams()
  const playerId = params.playerId as string

  const [loading, setLoading] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [email, setEmail] = useState('')
  const [hasAccount, setHasAccount] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sportsBackground, setSportsBackground] = useState('')
  const [medicalCheckExpiry, setMedicalCheckExpiry] = useState('')

  const [sports, setSports] = useState<Sport[]>([])
  const [belts, setBelts] = useState<Belt[]>([])
  const [currentBelt, setCurrentBelt] = useState('')
  const [targetBelt, setTargetBelt] = useState('')
  const [coachNote, setCoachNote] = useState('')

  const [savingAccount, setSavingAccount] = useState(false)
  const [accountMsg, setAccountMsg] = useState('')

  const [attendanceSportId, setAttendanceSportId] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [attendanceMessage, setAttendanceMessage] = useState('')

  const [subSportId, setSubSportId] = useState('')
  const [subSessions, setSubSessions] = useState('')
  const [savingSub, setSavingSub] = useState(false)

  const [weightSportId, setWeightSportId] = useState('')
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [addingWeight, setAddingWeight] = useState(false)
  const [weightMsg, setWeightMsg] = useState('')

  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([])
  const [nutritionError, setNutritionError] = useState('')

  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([])
  const [tpTitle, setTpTitle] = useState('')
  const [tpContent, setTpContent] = useState('')
  const [tpEventDate, setTpEventDate] = useState('')
  const [addingTp, setAddingTp] = useState(false)
  const [tpMsg, setTpMsg] = useState('')

  const [savingBelt, setSavingBelt] = useState(false)
  const [beltMessage, setBeltMessage] = useState('')

  async function loadNutritionPlans() {
    const { ok, data, error } = await safeFetchJson<{ plans: NutritionPlan[] }>(`/api/nutrition-plans?playerId=${playerId}`)
    if (ok && data) { setNutritionPlans(data.plans || []); setNutritionError('') }
    else if (error) setNutritionError(error)
  }

  async function loadTrainingPlans() {
    const { ok, data, error } = await safeFetchJson<{ plans: TrainingPlan[] }>(`/api/training-plans?playerId=${playerId}`)
    if (ok && data) { setTrainingPlans(data.plans || []); setTpMsg('') }
    else if (error) setTpMsg(error)
  }

  useEffect(() => {
    if (!playerId) return
    fetch(`/api/coach/player-details?playerId=${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.player) {
          setPlayerName(data.player.fullName)
          setEmail(data.player.email || '')
          setHasAccount(!!data.player.userId || !!data.player.email)
          setPhone(data.player.phone || '')
          setBirthDate(data.player.birthDate ? data.player.birthDate.split('T')[0] : '')
          setSportsBackground(data.player.sportsBackground || '')
          setMedicalCheckExpiry(data.player.medicalCheckExpiry ? data.player.medicalCheckExpiry.split('T')[0] : '')
          setCurrentBelt(data.player.currentBelt || '')
          setTargetBelt(data.player.targetBelt || '')
          setSports(data.playerSports || [])
          setWeightLogs(data.weightLogs || [])
          if (data.playerSports && data.playerSports.length > 0) {
            setWeightSportId(data.playerSports[0].id)
          }
        }
        if (data.belts) setBelts(data.belts)
      })
      .finally(() => setLoading(false))

    loadNutritionPlans()
    loadTrainingPlans()
  }, [playerId])

  async function handleSaveAccountData(e: React.FormEvent) {
    e.preventDefault()
    setSavingAccount(true)
    setAccountMsg('')

    const { ok, error } = await safeFetchJson('/api/coach/edit-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        email,
        newPassword: newPassword || undefined,
        phone,
        birthDate,
        sportsBackground,
        medicalCheckExpiry,
      }),
    })

    setSavingAccount(false)

    if (ok) {
      setAccountMsg('✅ تم حفظ البيانات بنجاح')
      if (email) setHasAccount(true)
      setNewPassword('')
    } else {
      setAccountMsg(error || 'حدث خطأ أثناء حفظ البيانات')
    }
  }

  async function handleMarkAttendance(present: boolean) {
    if (!attendanceSportId) {
      setAttendanceMessage('اختر الرياضة أولاً')
      return
    }
    setSavingAttendance(true)
    setAttendanceMessage('')

    const { ok, error } = await safeFetchJson('/api/coach/manage-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId: attendanceSportId, date: attendanceDate, present, coachNote }),
    })
    setSavingAttendance(false)

    if (!ok) {
      setAttendanceMessage(error || 'حدث خطأ')
      return
    }
    setAttendanceMessage(present ? '✅ تم تسجيل الحضور' : '❌ تم تسجيل الغياب')
    setCoachNote('')
  }

  async function handleAddSubscription(e: React.FormEvent) {
    e.preventDefault()
    if (!subSessions) return
    setSavingSub(true)

    await safeFetchJson('/api/coach/add-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId: subSportId || null, totalSessions: Number(subSessions) }),
    })

    setSavingSub(false)
    setSubSessions('')
  }

  async function handleSaveBelt() {
    setSavingBelt(true)
    setBeltMessage('')
    const { ok } = await safeFetchJson('/api/coach/update-belt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, currentBelt, targetBelt }),
    })
    setSavingBelt(false)
    setBeltMessage(ok ? '✅ تم حفظ الحزام' : 'حدث خطأ أثناء الحفظ')
  }

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault()
    if (!newWeight || !weightSportId) {
      setWeightMsg('اختر الرياضة وأدخل الوزن')
      return
    }
    setAddingWeight(true)
    setWeightMsg('')
    const { ok, data, error } = await safeFetchJson<{ log: WeightLog }>('/api/coach/manage-weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, sportId: weightSportId, weightKg: newWeight }),
    })
    setAddingWeight(false)
    if (ok && data?.log) {
      setWeightLogs((prev) => [data.log, ...prev])
      setNewWeight('')
      setWeightMsg('✅ تم الحفظ')
    } else {
      setWeightMsg(error || 'حدث خطأ')
    }
  }

  async function handleAddTrainingPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!tpTitle || !tpContent) return
    setAddingTp(true)
    setTpMsg('')
    const { ok, error } = await safeFetchJson('/api/training-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, title: tpTitle, content: tpContent, eventDate: tpEventDate || null }),
    })
    setAddingTp(false)
    if (ok) {
      setTpTitle('')
      setTpContent('')
      setTpEventDate('')
      loadTrainingPlans()
    } else {
      setTpMsg(error || 'حدث خطأ أثناء الحفظ')
    }
  }

  async function handleDeleteTrainingPlan(id: string) {
    if (!confirm('حذف هذا البرنامج؟')) return
    await safeFetchJson(`/api/training-plans?id=${id}`, { method: 'DELETE' })
    loadTrainingPlans()
  }

  if (loading) return <div style={pageStyle}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div>

  return (
    <div style={pageStyle}>
      <h1 style={{ color: '#f8fafc', textAlign: 'center' as const, marginBottom: 24 }}>{playerName}</h1>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>📝 بيانات الحساب والتواصل</h3>
        <form onSubmit={handleSaveAccountData}>
          <label style={labelStyle}>البريد الإلكتروني (اختياري لإنشاء حساب)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            disabled={hasAccount}
            placeholder={hasAccount ? "يمتلك اللاعب حساباً بالفعل" : "example@domain.com"}
          />

          <label style={labelStyle}>كلمة المرور (اختياري)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
            minLength={6}
            placeholder={hasAccount ? "أدخل كلمة مرور جديدة للتغيير" : "تعيين كلمة مرور للحساب الجديد (6 أحرف على الأقل)"}
          />

          <label style={labelStyle}>رقم الهاتف</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>تاريخ الميلاد</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>الخلفية الرياضية</label>
          <input type="text" value={sportsBackground} onChange={(e) => setSportsBackground(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>تاريخ انتهاء الكشف الطبي</label>
          <input type="date" value={medicalCheckExpiry} onChange={(e) => setMedicalCheckExpiry(e.target.value)} style={inputStyle} />

          <button type="submit" disabled={savingAccount} style={{ ...buttonStyle, width: '100%', marginTop: 16 }}>
            {savingAccount ? 'جارٍ الحفظ...' : 'حفظ البيانات والحساب'}
          </button>
          {accountMsg && <p style={{ color: accountMsg.includes('✅') ? '#22c55e' : '#ef4444', marginTop: 10, fontSize: 13.5 }}>{accountMsg}</p>}
        </form>
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>✅ تسجيل الحضور</h3>
        <label style={labelStyle}>الرياضة</label>
        <select value={attendanceSportId} onChange={(e) => setAttendanceSportId(e.target.value)} style={inputStyle}>
          <option value="">اختر الرياضة</option>
          {sports.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
        </select>
        <label style={labelStyle}>التاريخ</label>
        <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} style={inputStyle} />
        <label style={labelStyle}>ملاحظة (اختياري)</label>
        <input type="text" value={coachNote} onChange={(e) => setCoachNote(e.target.value)} style={inputStyle} />
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={() => handleMarkAttendance(true)} disabled={savingAttendance} style={{ ...buttonStyle, flex: 1, background: '#22c55e', color: '#0f172a' }}>✅ حضور</button>
          <button onClick={() => handleMarkAttendance(false)} disabled={savingAttendance} style={{ ...buttonStyle, flex: 1, background: '#ef4444', color: '#fff' }}>❌ غياب</button>
        </div>
        {attendanceMessage && <p style={{ color: '#e2e8f0', marginTop: 10, fontSize: 13.5 }}>{attendanceMessage}</p>}
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>🥋 تغيير الحزام</h3>
        <label style={labelStyle}>الحزام الحالي</label>
        <select value={currentBelt} onChange={(e) => setCurrentBelt(e.target.value)} style={inputStyle}>
          <option value="">اختر الحزام الحالي</option>
          {belts.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
        </select>
        <label style={labelStyle}>الحزام المطلوب</label>
        <select value={targetBelt} onChange={(e) => setTargetBelt(e.target.value)} style={inputStyle}>
          <option value="">اختر الحزام المطلوب</option>
          {belts.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
        </select>
        <button onClick={handleSaveBelt} disabled={savingBelt} style={{ ...buttonStyle, width: '100%', marginTop: 14 }}>{savingBelt ? '...' : 'حفظ الحزام'}</button>
        {beltMessage && <p style={{ color: '#22c55e', marginTop: 10, fontSize: 13.5 }}>{beltMessage}</p>}
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>📅 إضافة اشتراك جديد</h3>
        <p style={{ color: '#94a3b8', fontSize: 12.5, marginTop: -6 }}>تاريخ الانتهاء بيتحسب تلقائيًا حسب مواعيد تدريبك</p>
        <form onSubmit={handleAddSubscription}>
          <label style={labelStyle}>الرياضة</label>
          <select value={subSportId} onChange={(e) => setSubSportId(e.target.value)} style={inputStyle}>
            <option value="">اختر الرياضة</option>
            {sports.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>
          <label style={labelStyle}>عدد الحصص</label>
          <input type="number" min={1} value={subSessions} onChange={(e) => setSubSessions(e.target.value)} style={inputStyle} />
          <button type="submit" disabled={savingSub} style={{ ...buttonStyle, width: '100%', marginTop: 14 }}>{savingSub ? '...' : 'إضافة الاشتراك'}</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>⚖️ تطور الوزن</h3>
        {weightLogs.map((w) => (
          <div key={w.id} style={rowStyle}>
            <span style={{ color: '#e2e8f0' }}>{w.weightKg} كجم</span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(w.date).toLocaleDateString('ar-EG')}</span>
          </div>
        ))}
        {weightMsg && <p style={{ color: weightMsg.includes('✅') ? '#22c55e' : '#ef4444', fontSize: 13, marginTop: 8 }}>{weightMsg}</p>}
        <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' as const }}>
          <select value={weightSportId} onChange={(e) => setWeightSportId(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 130 }}>
            <option value="">اختر الرياضة</option>
            {sports.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>
          <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 130 }} placeholder="الوزن بالكيلوجرام" />
          <button type="submit" disabled={addingWeight} style={buttonStyle}>{addingWeight ? '...' : '+ إضافة'}</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>🥗 البرنامج الغذائي الخاص باللاعب</h3>
        <p style={{ color: '#64748b', fontSize: 12, marginTop: -6, marginBottom: 14 }}>
          يتم إعداد البرامج الغذائية من قبل الأدمن فقط — هذا القسم للعرض فقط
        </p>
        {nutritionError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{nutritionError}</p>}
        {nutritionPlans.length === 0 && !nutritionError && (
          <p style={{ color: '#94a3b8', fontSize: 13.5 }}>لا يوجد برنامج غذائي مسجّل لهذا اللاعب بعد</p>
        )}
        {nutritionPlans.map((np) => (
          <div key={np.id} style={{ ...rowStyle, flexDirection: 'column' as const, alignItems: 'flex-start' as const }}>
            <strong style={{ color: '#f8fafc', fontSize: 14 }}>{np.title}</strong>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0 0', whiteSpace: 'pre-wrap' as const }}>{np.content}</p>
            <span style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>{new Date(np.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>🏋️ برنامج تدريبي (قبل بطولة/معسكر)</h3>
        {trainingPlans.map((tp) => (
          <div key={tp.id} style={{ ...rowStyle, flexDirection: 'column' as const, alignItems: 'flex-start' as const }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <strong style={{ color: '#f8fafc', fontSize: 14 }}>{tp.title}</strong>
              <button type="button" onClick={() => handleDeleteTrainingPlan(tp.id)} style={{ ...smallBtn, background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>حذف</button>
            </div>
            {tp.eventDate && <span style={{ color: '#d4af37', fontSize: 12, marginTop: 4 }}>📅 {new Date(tp.eventDate).toLocaleDateString('ar-EG')}</span>}
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0 0', whiteSpace: 'pre-wrap' as const }}>{tp.content}</p>
          </div>
        ))}
        {tpMsg && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{tpMsg}</p>}
        <form onSubmit={handleAddTrainingPlan}>
          <label style={labelStyle}>عنوان البرنامج</label>
          <input value={tpTitle} onChange={(e) => setTpTitle(e.target.value)} style={inputStyle} placeholder="مثال: تجهيز لبطولة الجمهورية" />
          <label style={labelStyle}>موعد البطولة/المعسكر (اختياري)</label>
          <input type="date" value={tpEventDate} onChange={(e) => setTpEventDate(e.target.value)} style={inputStyle} />
          <label style={labelStyle}>تفاصيل البرنامج التدريبي</label>
          <textarea value={tpContent} onChange={(e) => setTpContent(e.target.value)} style={{ ...inputStyle, minHeight: 100 }} />
          <button type="submit" disabled={addingTp} style={{ ...buttonStyle, width: '100%', marginTop: 12 }}>{addingTp ? '...' : '+ إضافة برنامج تدريبي'}</button>
        </form>
      </div>
    </div>
  )
}