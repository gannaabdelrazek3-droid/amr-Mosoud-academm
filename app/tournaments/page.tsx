'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Tournament {
  id: string
  name: string
  date: string
  location: string | null
  description: string | null
  media: { id: string; type: 'IMAGE' | 'VIDEO'; url: string }[]
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tournaments')
      .then((res) => res.json())
      .then((data) => {
        if (data.tournaments) setTournaments(data.tournaments)
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
  }, [tournaments])

  const imageCount = (t: Tournament) => t.media.filter((m) => m.type === 'IMAGE').length
  const videoCount = (t: Tournament) => t.media.filter((m) => m.type === 'VIDEO').length
  const coverImage = (t: Tournament) => t.media.find((m) => m.type === 'IMAGE')?.url

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
        .tournament-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .tournament-card:hover {
          transform: translateY(-8px);
          border-color: rgba(212, 175, 55, 0.7) !important;
          box-shadow: 0 20px 45px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.25) !important;
        }
      `}</style>

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
          <span style={{ fontSize: 16 }}>🏆</span>
          <span style={{ color: '#d4af37', fontWeight: 800, fontSize: 14 }}>سجل بطولات الأكاديمية</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f8fafc', margin: '0 0 16px' }}>
          بطولات <span style={{ color: '#d4af37' }}>الأكاديمية</span>
        </h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 16 }}>
          نفتخر بمشاركاتنا وإنجازاتنا في البطولات المحلية والعربية والدولية
        </p>
      </section>

      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 24px 100px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>جارٍ تحميل البطولات...</p>
        ) : tournaments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>لا توجد بطولات معروضة حالياً</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {tournaments.map((t, idx) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="tournament-card reveal"
                style={{
                  textDecoration: 'none',
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                  display: 'block',
                  transitionDelay: `${idx * 0.05}s`,
                }}
              >
                <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#1e293b', position: 'relative' }}>
                  {coverImage(t) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverImage(t)} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50 }}>🏆</div>
                  )}
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 19, margin: '0 0 8px' }}>{t.name}</h3>
                  <p style={{ color: '#d4af37', fontSize: 13.5, fontWeight: 700, margin: '0 0 6px' }}>
                    📅 {new Date(t.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {t.location && <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 12px' }}>📍 {t.location}</p>}
                  <div style={{ display: 'flex', gap: 12, fontSize: 12.5, color: '#94a3b8' }}>
                    <span>📸 {imageCount(t)} صورة</span>
                    <span>🎥 {videoCount(t)} فيديو</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}