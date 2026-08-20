'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface ReportData {
  month: number
  year: number
  subscriptionIncome: number
  inventoryIncome: number
  grossIncome: number
  totalExpenses: number
  totalWithdrawals: number
  netIncome: number
  subscriptionPayments: { amount: number; date: string; description: string | null; playerName: string }[]
  productPayments: { amount: number; date: string; description: string | null }[]
  expenses: { title: string; category: string | null; amount: number; date: string }[]
  withdrawals: { withdrawnBy: string; reason: string | null; amount: number; date: string }[]
}

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

export default function FinancialReportPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadReport = useCallback(() => {
    setLoading(true)
    fetch(`/api/admin/financial-report?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [month, year])

  useEffect(() => { loadReport() }, [loadReport])

  function handlePrint() {
    window.print()
  }

  if (loading || !data) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>

  const statBox = (label: string, value: number, color: string) => (
    <div style={{ ...s.statCard, flex: '1 1 200px' }}>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color }}>{value.toFixed(2)} جنيه</p>
    </div>
  )

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>التقرير المالي الشهري</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>كشف كامل لكل عمليات الأكاديمية</p>
          </div>
          <button onClick={handlePrint} className="btn-primary" style={{ ...s.button, width: 'auto', padding: '12px 22px' }}>🖨️ طباعة / تصدير</button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={s.input}>
            {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={s.input}>
            {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 16, marginBottom: 28 }}>
          {statBox('💰 دخل الاشتراكات', data.subscriptionIncome, '#22c55e')}
          {statBox('📦 دخل المخزون', data.inventoryIncome, '#3b82f6')}
          {statBox('📊 إجمالي الدخل', data.grossIncome, '#d4af37')}
          {statBox('🧾 المصروفات', data.totalExpenses, '#ef4444')}
          {statBox('💸 المسحوبات', data.totalWithdrawals, '#ef4444')}
          {statBox('✅ صافي الربح', data.netIncome, data.netIncome >= 0 ? '#22c55e' : '#ef4444')}
        </div>

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={{ color: '#d4af37', marginTop: 0 }}>💰 مدفوعات الاشتراكات ({data.subscriptionPayments.length})</h3>
          {data.subscriptionPayments.length === 0 ? <p style={{ color: '#94a3b8' }}>لا توجد مدفوعات هذا الشهر</p> : (
            data.subscriptionPayments.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13.5, color: '#e2e8f0' }}>
                <span>{p.playerName} — {p.description || 'اشتراك'}</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>{p.amount.toFixed(2)} جنيه</span>
              </div>
            ))
          )}
        </div>

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={{ color: '#d4af37', marginTop: 0 }}>📦 مدفوعات المخزون ({data.productPayments.length})</h3>
          {data.productPayments.length === 0 ? <p style={{ color: '#94a3b8' }}>لا توجد مبيعات هذا الشهر</p> : (
            data.productPayments.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13.5, color: '#e2e8f0' }}>
                <span>{p.description || 'بيع منتج'}</span>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{p.amount.toFixed(2)} جنيه</span>
              </div>
            ))
          )}
        </div>

        <div style={{ ...s.formCard, marginBottom: 20 }}>
          <h3 style={{ color: '#d4af37', marginTop: 0 }}>🧾 المصروفات ({data.expenses.length})</h3>
          {data.expenses.length === 0 ? <p style={{ color: '#94a3b8' }}>لا توجد مصروفات هذا الشهر</p> : (
            data.expenses.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13.5, color: '#e2e8f0' }}>
                <span>{e.title} {e.category ? `(${e.category})` : ''}</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>{e.amount.toFixed(2)} جنيه</span>
              </div>
            ))
          )}
        </div>

        <div style={s.formCard}>
          <h3 style={{ color: '#d4af37', marginTop: 0 }}>💸 المسحوبات ({data.withdrawals.length})</h3>
          {data.withdrawals.length === 0 ? <p style={{ color: '#94a3b8' }}>لا توجد مسحوبات هذا الشهر</p> : (
            data.withdrawals.map((w, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13.5, color: '#e2e8f0' }}>
                <span>{w.withdrawnBy} {w.reason ? `— ${w.reason}` : ''}</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>{w.amount.toFixed(2)} جنيه</span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  )
}