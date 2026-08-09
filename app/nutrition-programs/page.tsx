'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Program {
  id: string
  title: string
  content: string
}

export default function NutritionProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/nutrition-programs')
      .then((res) => res.json())
      .then((data) => {
        if (data.programs) setPrograms(data.programs)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [programs])

  return (
    <div
      style={{
        background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 45%, #020617 100%)',
        minHeight: '100vh',
        fontFamily: "'Tajawal', sans-serif",
        color: '#e2e8f0',
        overflowX: 'hidden',
      }}
    >
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        .np-card { transition: transform 0.3s ease, border-color 0.3s ease; cursor: pointer; }
        .np-card:hover { transform: translateY(-6px); border-color: rgba(212,175,55,0.6); }
      `}</style>

      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 50px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'rgba(15, 23, 42, 0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{ fontSize: 26, filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.6))' }}>🥇</span>
          <strong style={{ color: '#f8fafc', fontSize: 20 }}>أكاديمية الكابتن عمرو مسعود</strong>
        </Link>
        <Link href="/" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          ← العودة للرئيسية
        </Link>
      </nav>

      <section className="reveal" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '60px 24px 20px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 22px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 35,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 16 }}>🥗</span>
          <span style={{ color: '#d4af37', fontWeight: 800, fontSize: 14 }}>التغذية الرياضية الصحيحة</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f8fafc', margin: '0 0 16px' }}>
          البرامج <span style={{ color: '#d4af37' }}>الغذائية</span>
        </h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 16 }}>
          أنظمة غذائية معتمدة من أكاديمية الكابتن عمرو مسعود لدعم أداء اللاعبين
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 100px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>جارٍ التحميل...</p>
        ) : programs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>لا توجد برامج غذائية معروضة حالياً</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
            {programs.map((p, idx) => (
              <div
                key={p.id}
                className="np-card reveal"
                onClick={() => setOpenId(openId === p.id ? null : p.id)}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: 18,
                  padding: 24,
                  transitionDelay: `${idx * 0.05}s`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18, margin: '0 0 10px' }}>{p.title}</h3>
                  <span style={{ color: '#d4af37', fontSize: 18 }}>{openId === p.id ? '−' : '+'}</span>
                </div>
                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: 14,
                    lineHeight: 1.8,
                    margin: 0,
                    whiteSpace: 'pre-wrap' as const,
                    display: openId === p.id ? 'block' : '-webkit-box',
                    WebkitLineClamp: openId === p.id ? 'unset' : 3,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: openId === p.id ? 'visible' : 'hidden',
                  }}
                >
                  {p.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}