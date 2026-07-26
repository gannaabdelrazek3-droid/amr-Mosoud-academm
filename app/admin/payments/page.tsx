import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'
import PaymentRow from './PaymentRow'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') redirect('/dashboard')

  const payments = await prisma.payment.findMany({
    where: { tenantId: profile.tenantId },
    include: { player: true },
    orderBy: { date: 'desc' },
    take: 100,
  })

  return (
    <AdminShell fullName={profile.fullName}>
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>سجل المدفوعات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>آخر 100 عملية دفع</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payments.map((p) => (
            <PaymentRow
              key={p.id}
              id={p.id}
              amount={p.amount}
              description={p.description}
              date={p.date.toISOString()}
              source={p.source}
              playerName={p.player?.fullName || null}
            />
          ))}
        </div>
      </div>
    </AdminShell>
  )
}