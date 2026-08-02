'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CoachSport {
  sport: { id: string; name: string }
}

interface Achievement {
  id: string
  title: string
  year: number | null
}

interface Coach {
  id: string
  fullName: string
  title: string | null
  bio: string | null
  avatarUrl: string | null
  yearsExperience: number | null
  playersTrained: number | null
  belts: string | null
  coachSports: CoachSport[]
  achievements: Achievement[]
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/coaches')
      .then((res) => res.json())
      .then((data) => {
        if (data.coaches) setCoaches(data.coaches)
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
  }, [coaches])

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
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .coach-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .coach-card:hover {
          transform: translateY(-10px);
          border-color: rgba(212, 175, 55, 0.7) !important;
          box-shadow: 0 20px 45px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.25) !important;
        }
        .coach-profile-btn {
          transition: all 0.25s ease;
        }
        .coach-profile-btn:hover {
          background: #d4af37 !important;
          color: #0f172a !important;
        }
      `}</style>

      {/* Top bar بسيط */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 50px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
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

      {/* Header */}
      <section className="reveal" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '60px 24px 20px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 22px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: 35,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 16 }}>🥋</span>
          <span style={{ color: '#d4af37', fontWeight: 800, fontSize: 14 }}>فريق التدريب المعتمد</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f8fafc', margin: '0 0 16px' }}>
          مدربو <span style={{ color: '#d4af37' }}>أكاديمية الكابتن عمرو مسعود</span>
        </h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 16 }}>
          نخبة من المدربين المعتمدين لإعداد الأبطال داخل وخارج مصر
        </p>
      </section>

      {/* Coaches Grid */}
      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 24px 100px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>جارٍ تحميل المدربين...</p>
        ) : coaches.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>لا يوجد مدربون معروضون حالياً</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {coaches.map((coach, idx) => (
              <div
                key={coach.id}
                className="coach-card reveal"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 22,
                  padding: 28,
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  transitionDelay: `${idx * 0.05}s`,
                }}
              >
                <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 20px' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: -6,
                      background: 'linear-gradient(135deg, #d4af37, #1e293b, #d4af37)',
                      borderRadius: '50%',
                      filter: 'blur(12px)',
                      opacity: 0.6,
                    }}
                  />
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '4px solid #d4af37',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      background: '#1e293b',
                    }}
                  >
                    {coach.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coach.avatarUrl} alt={coach.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#d4af37' }}>
                        🥋
                      </div>
                    )}
                  </div>
                </div>

                <h3 style={{ textAlign: 'center', color: '#f8fafc', fontWeight: 900, fontSize: 20, margin: '0 0 6px' }}>
                  كابتن {coach.fullName}
                </h3>
                {coach.title && (
                  <p style={{ textAlign: 'center', color: '#d4af37', fontWeight: 700, fontSize: 14, margin: '0 0 16px' }}>
                    {coach.title}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                  {coach.yearsExperience != null && (
                    <span style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: 12.5, color: '#e2e8f0' }}>
                      ⏱️ خبرة {coach.yearsExperience} سنة
                    </span>
                  )}
                  {coach.playersTrained != null && (
                    <span style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: 12.5, color: '#e2e8f0' }}>
                      👥 {coach.playersTrained}+ لاعب
                    </span>
                  )}
                </div>

                {coach.coachSports.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {coach.coachSports.map((cs) => (
                      <span key={cs.sport.id} style={{ color: '#0f172a', background: '#d4af37', fontSize: 11.5, fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}>
                        {cs.sport.name}
                      </span>
                    ))}
                  </div>
                )}

                {coach.achievements.length > 0 && (
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, padding: 14, border: '1px solid rgba(212, 175, 55, 0.15)', marginBottom: 18, flexGrow: 1 }}>
                    <p style={{ color: '#d4af37', fontSize: 12.5, fontWeight: 800, margin: '0 0 8px' }}>🏆 أبرز الإنجازات:</p>
                    <ul style={{ margin: 0, paddingRight: 16, color: '#e2e8f0', fontSize: 13, lineHeight: 1.8 }}>
                      {coach.achievements.slice(0, 3).map((a) => (
                        <li key={a.id}>{a.title}{a.year ? ` (${a.year})` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  href={`/coaches/${coach.id}`}
                  className="coach-profile-btn"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: 'auto',
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: '2px solid rgba(212, 175, 55, 0.5)',
                    color: '#d4af37',
                    fontWeight: 800,
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  عرض الملف الشخصي
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}