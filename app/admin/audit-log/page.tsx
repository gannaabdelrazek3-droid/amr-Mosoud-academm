import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

const actionLabels: Record<string, string> = {
  CREATE: 'إنشاء',
  UPDATE: 'تعديل',
  DELETE: 'حذف',
  CANCEL: 'إلغاء',
  APPROVE: 'موافقة',
  REJECT: 'رفض',
}

export default async function AuditLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') redirect('/dashboard')

  const logs = await prisma.auditLog.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <AdminShell fullName={profile.fullName}>
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>سجل العمليات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>آخر 200 عملية حساسة تمت في النظام</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: 10,
                padding: '12px 16px',
              }}
            >
              <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14 }}>
                <strong style={{ color: '#d4af37' }}>{actionLabels[log.action] || log.action}</strong>
                {' '}على <strong>{log.entity}</strong>
                {log.details && ` — ${log.details}`}
              </p>
              <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>
                بواسطة {log.userRole} — {new Date(log.createdAt).toLocaleString('ar-EG')}
              </p>
            </div>
          ))}
          {logs.length === 0 && <p style={{ color: '#94a3b8' }}>لا توجد عمليات مسجّلة بعد</p>}
        </div>
      </div>
    </AdminShell>
  )
}