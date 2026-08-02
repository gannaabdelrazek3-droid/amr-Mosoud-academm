'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface FeaturedPlayer {
  id: string
  season: number
  name: string
  imageUrl: string | null
  sport: string | null
  reason: string | null
  achievement: string | null
}

export default function FeaturedPlayersPage() {
  const [players, setPlayers] = useState<FeaturedPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSeason, setActiveSeason] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/featured-players')
      .then((res) => res.json())
      .then((data) => {
        if (data.players) {
          setPlayers(data.players)
          if (data.players.length > 0) {
            const seasons: number[] = data.players.map((p: FeaturedPlayer) => p.season)
            setActiveSeason(Math.max(...seasons))
          }
        }
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
  }, [players, activeSeason])

  const seasons = Array.from(new Set(players.map((p) => p.season))).sort((a, b) => b - a)
  const filteredPlayers = activeSeason != null ? players.filter((p) => p.season === activeSeason) : []

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
        .fp-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .fp-card:hover {
          transform: translateY(-8px);
          border-color: rgba(212, 175, 55, 0.7) !important;
          box-shadow: 0 20px 45px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.25) !important;
        }
        .season-tab {
          padding: 12px 28px;
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.35);
          background: transparent;
          color: #94a3b8;
          font-family: 'Tajawal', sans-serif;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.25s;
        }
        .season-tab.active {
          background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
          color: #0f172a;
          border-color: #d4af37;
          box-shadow: 0 8px 25px rgba(212,175,55,0.4);
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
          <span style={{ fontSize: 16 }}>⭐</span>
          <span style={{ color: '#d4af37', fontWeight: 800, fontSize: 14 }}>أبطال الموسم</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f8fafc', margin: '0 0 16px' }}>
          اللاعبون <span style={{ color: '#d4af37' }}>المميزون</span>
        </h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 16 }}>
          نفتخر بأبطال الأكاديمية الذين تميزوا بكل فخر خلال كل موسم رياضي
        </p>
      </section>

      {seasons.length > 0 && (
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {seasons.map((season) => (
              <button
                key={season}
                className={`season-tab ${activeSeason === season ? 'active' : ''}`}
                onClick={() => setActiveSeason(season)}
              >
                موسم {season}
              </button>
            ))}
          </div>
        </section>
      )}

      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 24px 100px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>جارٍ التحميل...</p>
        ) : filteredPlayers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>لا يوجد لاعبون مميزون في هذا الموسم حالياً</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22 }}>
            {filteredPlayers.map((p, idx) => (
              <div
                key={p.id}
                className="fp-card reveal"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 20,
                  padding: 24,
                  textAlign: 'center',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                  transitionDelay: `${idx * 0.05}s`,
                }}
              >
                <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: -5,
                      background: 'linear-gradient(135deg, #d4af37, #1e293b, #d4af37)',
                      borderRadius: '50%',
                      filter: 'blur(10px)',
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
                      border: '3px solid #d4af37',
                      background: '#1e293b',
                    }}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#d4af37' }}>🥋</div>
                    )}
                  </div>
                </div>

                <h3 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 17, margin: '0 0 6px' }}>{p.name}</h3>
                {p.sport && (
                  <span style={{ display: 'inline-block', color: '#0f172a', background: '#d4af37', fontSize: 11.5, fontWeight: 800, padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
                    {p.sport} 🏆
                  </span>
                )}

                {p.achievement && (
                  <p style={{ color: '#e2e8f0', fontSize: 13.5, fontWeight: 700, margin: '10px 0 4px' }}>{p.achievement}</p>
                )}
                {p.reason && <p style={{ color: '#94a3b8', fontSize: 12.5, margin: 0, lineHeight: 1.7 }}>{p.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}