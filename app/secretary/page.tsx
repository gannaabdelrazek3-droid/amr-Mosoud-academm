import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import SignOutButtonGeneric from '../SignOutButtonGeneric'

export default async function SecretaryHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'SECRETARY') redirect('/dashboard')

  return (
    <div style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', fontFamily: "'Tajawal', sans-serif", padding: '40px 20px', color: '#e2e8f0', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <h1 style={{ color: '#f8fafc' }}>أهلًا بك، {profile.fullName}</h1>
        <p style={{ color: '#94a3b8', marginBottom: 30 }}>اختر ما تريد القيام به</p>
        <div style={{ marginBottom: 20 }}>
          <SignOutButtonGeneric />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <a href="/secretary/add-player" style={{ padding: '18px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 14, color: '#f1f5f9', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
            ➕ إضافة لاعب جديد
          </a>
          <a href="/secretary/add-payment" style={{ padding: '18px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 14, color: '#f1f5f9', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
            💵 تسجيل دخل / إيراد
          </a>
          <a href="/secretary/attendance" style={{ padding: '18px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 14, color: '#f1f5f9', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
            ✅ تسجيل الحضور اليومي
          </a>
          <a href="/secretary/subscriptions" style={{ padding: '18px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 14, color: '#f1f5f9', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
            📅 متابعة الاشتراكات
          </a>
          <a href="/secretary/inventory" style={{ padding: '18px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 14, color: '#f1f5f9', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
            📦 المخزون والمبيعات
          </a>
        </div>
      </div>
    </div>
  )
}