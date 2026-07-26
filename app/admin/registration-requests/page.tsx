import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'
import ApproveButton from './ApproveButton'

export default async function RegistrationRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') redirect('/dashboard')

  const requests = await prisma.registrationRequest.findMany({
    where: { tenantId: profile.tenantId, status: 'pending' },
    orderBy: { createdAt: 'desc' },
  })

  const coaches = await prisma.profile.findMany({
    where: { tenantId: profile.tenantId, role: 'COACH' },
    select: { id: true, fullName: true },
  })

  return (
    <AdminShell fullName={profile.fullName}>
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>طلبات التسجيل الجديدة</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>{requests.length} طلب في الانتظار</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>لا توجد طلبات تسجيل جديدة حاليًا</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {requests.map((r) => (
              <div
                key={r.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px' }}>الاسم</p>
                    <p style={{ color: '#f8fafc', fontWeight: 700, margin: 0 }}>{r.fullName}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px' }}>السن</p>
                    <p style={{ color: '#f8fafc', fontWeight: 700, margin: 0 }}>{r.age}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px' }}>رقم الهاتف</p>
                    <p style={{ color: '#f8fafc', fontWeight: 700, margin: 0 }}>{r.phone}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px' }}>المحافظة</p>
                    <p style={{ color: '#f8fafc', fontWeight: 700, margin: 0 }}>{r.governorate}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px' }}>الرياضة</p>
                    <p style={{ color: '#d4af37', fontWeight: 700, margin: 0 }}>{r.sport}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px' }}>المستوى</p>
                    <p style={{ color: '#f8fafc', fontWeight: 700, margin: 0 }}>{r.level}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px' }}>سبق المشاركة؟</p>
                    <p style={{ color: '#f8fafc', fontWeight: 700, margin: 0 }}>{r.hasCompeted ? 'نعم' : 'لا'}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px' }}>البريد الإلكتروني</p>
                    <p style={{ color: '#f8fafc', fontWeight: 700, margin: 0 }}>{r.email}</p>
                  </div>
                </div>

                <ApproveButton requestId={r.id} coaches={coaches} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}