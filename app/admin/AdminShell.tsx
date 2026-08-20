'use client'

import { useState } from 'react'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

const navLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { href: '/admin/calendar', label: 'التقويم', icon: '📅' },
  { href: '/admin/add-player', label: 'إضافة لاعب', icon: '➕' },
  { href: '/admin/add-staff', label: 'إضافة موظف', icon: '🏋️' },
  { href: '/admin/coaches', label: 'المدربين', icon: '👨‍🏫' },
  { href: '/admin/sports', label: 'الرياضات', icon: '🏅' },
  { href: '/admin/belts', label: 'الأحزمة', icon: '🥋' },
  { href: '/admin/inventory', label: 'المخزون', icon: '📦' },
  { href: '/admin/subscriptions', label: 'الاشتراكات', icon: '📅' },
  { href: '/admin/search', label: 'البحث', icon: '🔍' },
  { href: '/admin/registration-requests', label: 'طلبات التسجيل', icon: '📋' },
  { href: '/admin/audit-log', label: 'سجل العمليات', icon: '🕵️' },
  { href: '/admin/payments', label: 'المدفوعات', icon: '💰' },
  { href: '/admin/tournaments', label: 'البطولات', icon: '🏆' },
  { href: '/admin/albums', label: 'معرض الصور', icon: '📸' },
  { href: '/admin/featured-players', label: 'اللاعبون المميزون', icon: '⭐' },
  { href: '/admin/academy-info', label: 'معلومات الأكاديمية', icon: 'ℹ️' },
{ href: '/admin/news', label: 'الأخبار', icon: '📰' },
{ href: '/admin/nutrition-programs', label: 'البرامج الغذائية', icon: '🥗' },
{ href: '/admin/coach-schedules', label: 'مواعيد التدريب', icon: '🗓️' },
{ href: '/admin/expenses', label: 'المصروفات', icon: '🧾' },
{ href: '/admin/withdrawals', label: 'المسحوبات', icon: '💸' },
{ href: '/admin/financial-report', label: 'التقرير المالي', icon: '📊' },
{ href: '/admin/attendance-matrix', label: 'لوحة الحضور', icon: '🚦' },
]

export default function AdminShell({
  children,
  fullName,
}: {
  children: React.ReactNode
  fullName: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: "'Tajawal', system-ui, sans-serif",
      }}
    >
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }
        .admin-sidebar {
          width: 240px;
          background: rgba(15, 23, 42, 0.95);
          border-left: 1px solid rgba(212, 175, 55, 0.2);
          padding: 28px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }
        .admin-topbar {
          display: none;
        }
        .admin-main {
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 768px) {
          .admin-layout {
            flex-direction: column;
          }
          .admin-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            background: rgba(15, 23, 42, 0.95);
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            position: sticky;
            top: 0;
            z-index: 40;
          }
          .admin-sidebar {
            width: 100%;
            display: ${menuOpen ? 'flex' : 'none'};
            border-left: none;
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            position: relative;
            z-index: 30;
          }
          .admin-main {
            padding: 0;
          }
        }
      `}</style>

      <div className="admin-layout">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>👑</span>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15 }}>{fullName}</span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: 8,
              color: '#d4af37',
              padding: '8px 14px',
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <aside className="admin-sidebar">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 34 }}>👑</div>
            <p style={{ color: '#f8fafc', fontWeight: 700, marginTop: 8 }}>{fullName}</p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>المسؤول</p>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
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

        <main className="admin-main">{children}</main>
      </div>
    </div>
  )
}