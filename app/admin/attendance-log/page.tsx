'use client'

import { useState, useEffect } from 'react'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface AttendanceRecord {
  id: string
  playerName: string
  sportName: string
  date: string
  present: boolean
  coachNote: string | null
  recordedBy: { fullName: string; role: string } | null
}

const roleLabel: Record<string, string> = { ADMIN: 'الأدمن', COACH: 'المدرب', SECRETARY: 'السكرتيرة' }

export default function AdminAttendanceLogPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/attendance-log')
      .then((res) => res.json())
      .then((data) => setRecords(data.records || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminShell fullName=""><div style={s.page}><p style={{ color: '#e2e8f0' }}>جارٍ التحميل...</p></div></AdminShell>

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>سجل الحضور والغياب</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>متابعة كل سجلات الحضور، بما فيها ما تسجله السكرتيرة والمدربون</p>
          </div>
        </div>

        <div style={{ ...s.formCard, overflowX: 'auto' as const, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>اللاعب</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>الرياضة</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>التاريخ</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>الحالة</th>
                <th style={{ padding: 12, textAlign: 'right' as const, color: '#d4af37' }}>سجّله</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#e2e8f0' }}>{r.playerName}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{r.sportName}</td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{ color: r.present ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{r.present ? '✅ حضر' : '❌ غاب'}</span>
                  </td>
                  <td style={{ padding: 12, color: '#94a3b8' }}>
                    {r.recordedBy ? `${r.recordedBy.fullName} (${roleLabel[r.recordedBy.role] || r.recordedBy.role})` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}