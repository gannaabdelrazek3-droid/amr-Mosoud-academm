'use client'

import { useState, useEffect, useCallback } from 'react'

interface SubItem {
  playerId: string
  fullName: string
  remaining: number
  totalSessions: number
  endDate: string | null
  status: 'active' | 'expiring' | 'expired' | 'pending'
  hasPendingRenewal: boolean
  pendingTotal: number
  pendingPaid: number
  pendingRemaining: number
}

const statusInfo = {
  active: { label: 'نشط', color: '#22c55e' },
  expiring: { label: 'قرب الانتهاء', color: '#d4af37' },
  expired: { label: 'منتهي', color: '#ef4444' },
  pending: { label: 'دفع معلّق', color: '#d4af37' },
}

const cardStyle = {
  background: 'rgba(30,41,59,0.6)',
  borderRadius: 14,
  padding: '16px 18px',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginTop: 6,
  marginBottom: 12,
  fontSize: 14,
  fontFamily: "'Tajawal', sans-serif",
  border: '1px solid rgba(148,163,184,0.3)',
  borderRadius: 8,
  background: 'rgba(15,23,42,0.5)',
  color: '#f1f5f9',
  boxSizing: 'border-box' as const,
}

const labelStyle = { display: 'block', color: '#cbd5e1', fontWeight: 700, fontSize: 13 }

const buttonStyle = {
  padding: '10px 20px',
  background: '#d4af37',
  color: '#0f172a',
  border: 'none',
  borderRadius: 8,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'Tajawal', sans-serif",
}

export default function SecretarySubscriptionsPage() {
  const [subs, setSubs] = useState<SubItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState('')

  const [totalAmount, setTotalAmount] = useState('')
  const [paidAmountNow, setPaidAmountNow] = useState('')
  const [sessions, setSessions] = useState('')
  const [duration, setDuration] = useState('30')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageColor, setMessageColor] = useState('#22c55e')

  const loadSubs = useCallback(() => {
    setLoading(true)
    fetch('/api/secretary/subscriptions')
      .then((res) => res.json())
      .then((data) => setSubs(data.subscriptions || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadSubs()
  }, [loadSubs])

  function openRenew(s: SubItem) {
    setOpenId(s.playerId)
    setTotalAmount(s.hasPendingRenewal ? s.pendingTotal.toString() : '')
    setPaidAmountNow('')
    setSessions('')
    setDuration('30')
    setMessage('')
  }

  async function handleRenew(e: React.FormEvent, item: SubItem) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const body: Record<string, unknown> = {
      playerId: openId,
      paidAmountNow,
    }
    if (!item.hasPendingRenewal) {
      body.totalAmount = totalAmount
      body.totalSessions = sessions
      body.durationDays = duration
    }

    const res = await fetch('/api/secretary/renew-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessageColor('#ef4444')
      setMessage(data.error || 'حدثت مشكلة، حاول مرة أخرى')
      return
    }

    if (data.activated) {
      setMessageColor('#22c55e')
      setMessage(`✅ تم دفع المبلغ بالكامل وتفعيل اشتراك ${item.fullName} بنجاح.`)
    } else {
      setMessageColor('#d4af37')
      setMessage(`💰 تم تسجيل دفعة جزئية لـ ${item.fullName}. الاشتراك لن يتفعّل إلا بعد سداد المتبقي: ${data.remainingAmount.toFixed(2)} جنيه.`)
    }

    setOpenId('')
    loadSubs()
  }

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '32px 20px', color: '#e2e8f0' }}>
        <h1 style={{ color: '#f8fafc' }}>متابعة الاشتراكات</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>حالة اشتراكات كل اللاعبين، مع إمكانية استكمال الدفع والتجديد</p>

        {message && (
          <p style={{ color: messageColor, fontWeight: 700, marginBottom: 16, padding: '10px 16px', background: `${messageColor}15`, borderRadius: 10, border: `1px solid ${messageColor}40` }}>
            {message}
          </p>
        )}

        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : subs.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا توجد اشتراكات مسجّلة</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subs.map((s) => (
              <div key={s.playerId} style={{ ...cardStyle, border: `1px solid ${statusInfo[s.status].color}40` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: 16 }}>{s.fullName}</p>
                    {s.endDate && (
                      <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>
                        {s.remaining} من {s.totalSessions} حصة — ينتهي {new Date(s.endDate).toLocaleDateString('ar-EG')}
                      </p>
                    )}
                    {s.hasPendingRenewal && (
                      <p style={{ fontSize: 13, margin: '6px 0 0', color: '#d4af37', fontWeight: 700 }}>
                        ⏳ دفع {s.pendingPaid.toFixed(2)} من {s.pendingTotal.toFixed(2)} جنيه — متبقي {s.pendingRemaining.toFixed(2)} جنيه
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: statusInfo[s.status].color, fontWeight: 800, fontSize: 14 }}>
                      {statusInfo[s.status].label}
                    </span>
                    <button type="button" onClick={() => openRenew(s)} style={buttonStyle}>
                      {s.hasPendingRenewal ? 'إكمال الدفع' : 'تجديد'}
                    </button>
                  </div>
                </div>

                {openId === s.playerId && (
                  <form onSubmit={(e) => handleRenew(e, s)} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                    {!s.hasPendingRenewal && (
                      <>
                        <label style={labelStyle}>قيمة الاشتراك الكاملة (جنيه)</label>
                        <input type="number" step="0.5" min="0" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} style={inputStyle} required />

                        <label style={labelStyle}>عدد الحصص</label>
                        <input type="number" min="1" value={sessions} onChange={(e) => setSessions(e.target.value)} style={inputStyle} required />

                        <label style={labelStyle}>مدة الاشتراك (أيام)</label>
                        <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} required />
                      </>
                    )}

                    {s.hasPendingRenewal && (
                      <div style={{ margin: '4px 0 14px', padding: '10px 14px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8 }}>
                        <span style={{ color: '#d4af37', fontSize: 13, fontWeight: 700 }}>
                          الإجمالي: {s.pendingTotal.toFixed(2)} جنيه — المدفوع: {s.pendingPaid.toFixed(2)} جنيه — المتبقي: {s.pendingRemaining.toFixed(2)} جنيه
                        </span>
                      </div>
                    )}

                    <label style={labelStyle}>المبلغ المدفوع الآن (جنيه)</label>
                    <input type="number" step="0.5" min="0" value={paidAmountNow} onChange={(e) => setPaidAmountNow(e.target.value)} style={inputStyle} required />

                    <button type="submit" disabled={saving} style={{ ...buttonStyle, width: '100%' }}>
                      {saving ? 'جارٍ الحفظ...' : 'تأكيد الدفع'}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}