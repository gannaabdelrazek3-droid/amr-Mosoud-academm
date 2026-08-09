'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface DuePlayer {
  id: string
  fullName: string
  lastEndDate: string | null
  lastRemaining: number | null
  hasPendingRenewal: boolean
  pendingTotal: number
  pendingPaid: number
  pendingRemaining: number
}

export default function SubscriptionsPage() {
  const [players, setPlayers] = useState<DuePlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState('')

  const [totalAmount, setTotalAmount] = useState('')
  const [paidAmountNow, setPaidAmountNow] = useState('')
  const [sessions, setSessions] = useState('')
  const [duration, setDuration] = useState('30')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageColor, setMessageColor] = useState('#22c55e')

  const loadPlayers = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/subscriptions/due')
      .then((res) => res.json())
      .then((data) => setPlayers(data.players || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  function openRenew(p: DuePlayer) {
    setOpenId(p.id)
    setTotalAmount(p.hasPendingRenewal ? p.pendingTotal.toString() : '')
    setPaidAmountNow('')
    setSessions('')
    setDuration('30')
    setMessage('')
  }

  async function handleRenew(e: React.FormEvent, player: DuePlayer) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const body: Record<string, unknown> = {
      playerId: openId,
      paidAmountNow,
    }
    if (!player.hasPendingRenewal) {
      body.totalAmount = totalAmount
      body.totalSessions = sessions
      body.durationDays = duration
    }

    const res = await fetch('/api/admin/subscriptions/renew', {
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
      setMessage(`✅ تم دفع المبلغ بالكامل وتفعيل اشتراك ${player.fullName} بنجاح.`)
    } else {
      setMessageColor('#d4af37')
      setMessage(`💰 تم تسجيل دفعة جزئية لـ ${player.fullName}. الاشتراك لن يتفعّل إلا بعد سداد المتبقي: ${data.remainingAmount.toFixed(2)} جنيه من إجمالي ${data.totalAmount.toFixed(2)} جنيه.`)
    }

    setOpenId('')
    loadPlayers()
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

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>تجديد الاشتراكات الشهرية</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>اللاعبون الذين يحتاجون تجديدًا أو لديهم دفعات معلّقة ({players.length})</p>
          </div>
        </div>

        {message && (
          <p style={{ color: messageColor, fontWeight: 700, marginBottom: 16, padding: '10px 16px', background: `${messageColor}15`, borderRadius: 10, border: `1px solid ${messageColor}40` }}>
            {message}
          </p>
        )}

        {players.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>جميع الاشتراكات سارية ومكتملة الدفع، لا يوجد من يحتاج تجديدًا حاليًا 🎉</p>
        ) : (
          players.map((p) => (
            <div key={p.id} style={{ ...s.formCard, marginBottom: 16, maxWidth: '100%', border: p.hasPendingRenewal ? '1px solid rgba(212,175,55,0.5)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: 17 }}>{p.fullName}</strong>
                  <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0' }}>
                    {p.lastEndDate ? `انتهى آخر اشتراك في ${new Date(p.lastEndDate).toLocaleDateString('ar-EG')}` : 'لم يُسجَّل له أي اشتراك بعد'}
                  </p>
                  {p.hasPendingRenewal && (
                    <p style={{ fontSize: 13.5, margin: '6px 0 0', color: '#d4af37', fontWeight: 700 }}>
                      ⏳ تجديد معلّق: دفع {p.pendingPaid.toFixed(2)} من {p.pendingTotal.toFixed(2)} جنيه — متبقي {p.pendingRemaining.toFixed(2)} جنيه (لن يتفعّل الاشتراك الجديد حتى يكتمل الدفع)
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openRenew(p)}
                  className="btn-primary"
                  style={{ padding: '10px 20px', background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  {p.hasPendingRenewal ? 'إكمال الدفع' : 'تجديد'}
                </button>
              </div>

              {openId === p.id && (
                <form onSubmit={(e) => handleRenew(e, p)} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                  {!p.hasPendingRenewal && (
                    <>
                      <label style={s.label}>
                        قيمة الاشتراك الكاملة (جنيه)
                        <input type="number" step="0.5" min="0" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} style={s.input} required />
                      </label>
                      <label style={s.label}>
                        عدد الحصص
                        <input type="number" min="1" value={sessions} onChange={(e) => setSessions(e.target.value)} style={s.input} required />
                      </label>
                      <label style={s.label}>
                        مدة الاشتراك (أيام)
                        <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} style={s.input} required />
                      </label>
                    </>
                  )}

                  {p.hasPendingRenewal && (
                    <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8 }}>
                      <span style={{ color: '#d4af37', fontSize: 13.5, fontWeight: 700 }}>
                        إجمالي الاشتراك: {p.pendingTotal.toFixed(2)} جنيه — المدفوع سابقًا: {p.pendingPaid.toFixed(2)} جنيه — المتبقي: {p.pendingRemaining.toFixed(2)} جنيه
                      </span>
                    </div>
                  )}

                  <label style={s.label}>
                    المبلغ المدفوع الآن (جنيه)
                    <input type="number" step="0.5" min="0" value={paidAmountNow} onChange={(e) => setPaidAmountNow(e.target.value)} style={s.input} required />
                  </label>

                  <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
                    {saving ? 'جارٍ الحفظ...' : 'تأكيد الدفع'}
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </AdminShell>
  )
}