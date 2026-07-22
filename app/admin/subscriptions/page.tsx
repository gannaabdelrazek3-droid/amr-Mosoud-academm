'use client'

import { useState, useEffect } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface DuePlayer {
  id: string
  fullName: string
  lastEndDate: string | null
  lastRemaining: number | null
}

export default function SubscriptionsPage() {
  const [players, setPlayers] = useState<DuePlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState('')

  const [amount, setAmount] = useState('')
  const [sessions, setSessions] = useState('')
  const [duration, setDuration] = useState('30')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function loadPlayers() {
    setLoading(true)
    fetch('/api/admin/subscriptions/due')
      .then((res) => res.json())
      .then((data) => setPlayers(data.players || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPlayers() }, [])

  function openRenew(id: string) {
    setOpenId(id); setAmount(''); setSessions(''); setDuration('30'); setMessage('')
  }

  async function handleRenew(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/subscriptions/renew', {
      method: 'POST',
      body: JSON.stringify({ playerId: openId, amount, totalSessions: sessions, durationDays: duration }),
    })
    setSaving(false)
    if (!res.ok) { setMessage('حدثت مشكلة، حاول مرة أخرى'); return }
    setOpenId('')
    loadPlayers()
  }

  if (loading) {
    return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>
  }

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>تجديد الاشتراكات الشهرية</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>اللاعبون الذين يحتاجون تجديدًا ({players.length})</p>
          </div>
        </div>

        {players.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>جميع الاشتراكات سارية، لا يوجد من يحتاج تجديدًا حاليًا 🎉</p>
        ) : (
          players.map((p) => (
            <div key={p.id} style={{ ...s.formCard, marginBottom: 16, maxWidth: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: 17 }}>{p.fullName}</strong>
                  <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0' }}>
                    {p.lastEndDate ? `انتهى آخر اشتراك في ${new Date(p.lastEndDate).toLocaleDateString('ar-EG')}` : 'لم يُسجَّل له أي اشتراك بعد'}
                  </p>
                </div>
                <button onClick={() => openRenew(p.id)} className="btn-primary" style={{ padding: '10px 20px', background: '#d4af37', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 700 }}>
                  تجديد
                </button>
              </div>

              {openId === p.id && (
                <form onSubmit={handleRenew} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                  <label style={s.label}>
                    المبلغ (جنيه)
                    <input type="number" step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} style={s.input} required />
                  </label>
                  <label style={s.label}>
                    عدد الحصص
                    <input type="number" min="1" value={sessions} onChange={(e) => setSessions(e.target.value)} style={s.input} required />
                  </label>
                  <label style={s.label}>
                    مدة الاشتراك (أيام)
                    <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} style={s.input} required />
                  </label>
                  <button type="submit" disabled={saving} className="btn-primary" style={s.button}>
                    {saving ? 'جارٍ الحفظ...' : 'تأكيد التجديد'}
                  </button>
                </form>
              )}
            </div>
          ))
        )}

        {message && <p style={s.error}>{message}</p>}
      </div>
    </AdminShell>
  )
}