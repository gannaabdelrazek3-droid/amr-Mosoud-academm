import Link from 'next/link'
import SignOutButton from './SignOutButton'

const navLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { href: '/admin/add-player', label: 'إضافة لاعب', icon: '➕' },
  { href: '/admin/add-coach', label: 'إضافة مدرب', icon: '🏋️' },
  { href: '/admin/sports', label: 'الرياضات', icon: '🏅' },
  { href: '/admin/inventory', label: 'المخزون', icon: '📦' },
  { href: '/admin/subscriptions', label: 'الاشتراكات', icon: '📅' },
  { href: '/admin/search', label: 'البحث', icon: '🔍' },
]

export default function AdminShell({
  children,
  fullName,
}: {
  children: React.ReactNode
  fullName: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: "'Tajawal', system-ui, sans-serif",
      }}
    >
      <aside
        style={{
          width: 240,
          background: 'rgba(15, 23, 42, 0.9)',
          borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '28px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 34 }}>👑</div>
          <p style={{ color: '#f8fafc', fontWeight: 700, marginTop: 8 }}>{fullName}</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>المسؤول</p>
        </div>

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 10,
              color: '#e2e8f0',
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 600,
            }}
            className="sidebar-link"
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
          <SignOutButton />
        </div>
      </aside>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  )
}