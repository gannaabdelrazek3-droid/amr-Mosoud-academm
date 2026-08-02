'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface CoachSport {
  sport: { id: string; name: string }
}

interface Achievement {
  id: string
  title: string
  year: number | null
}

interface Certificate {
  id: string
  title: string
  imageUrl: string | null
}

interface GalleryItem {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption: string | null
}

interface CoachDetail {
  id: string
  fullName: string
  title: string | null
  bio: string | null
  avatarUrl: string | null
  yearsExperience: number | null
  playersTrained: number | null
  belts: string | null
  whatsapp: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  trainingSchedule: string | null
  coachSports: CoachSport[]
  achievements: Achievement[]
  certificates: Certificate[]
  galleryItems: GalleryItem[]
}

export default function CoachProfilePage() {
  const params = useParams()
  const id = params?.id as string

  const [coach, setCoach] = useState<CoachDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/coaches/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data?.coach) setCoach(data.coach)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={pageBg}>
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 100 }}>جارٍ التحميل...</p>
      </div>
    )
  }

  if (notFound || !coach) {
    return (
      <div style={pageBg}>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <p style={{ color: '#e2e8f0', fontSize: 18, marginBottom: 20 }}>المدرب غير موجود</p>
          <Link href="/coaches" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 700 }}>
            ← العودة لصفحة المدربين
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={pageBg}>
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
        .gallery-item {
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        .gallery-item:hover {
          transform: scale(1.04);
        }
        .contact-btn {
          transition: all 0.25s ease;
        }
        .contact-btn:hover {
          transform: translateY(-4px);
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
        <Link href="/coaches" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          ← كل المدربين
        </Link>
      </nav>

      <section className="reveal" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 20px', display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 220, height: 220, flexShrink: 0, margin: '0 auto' }}>
          <div
            style={{
              position: 'absolute',
              inset: -8,
              background: 'linear-gradient(135deg, #d4af37, #1e293b, #d4af37)',
              borderRadius: '50%',
              filter: 'blur(18px)',
              opacity: 0.7,
            }}
          />
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              border: '5px solid #d4af37',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
              background: '#1e293b',
            }}
          >
            {coach.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coach.avatarUrl} alt={coach.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70, color: '#d4af37' }}>🥋</div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 280, textAlign: 'center' as const }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f8fafc', margin: '0 0 8px' }}>
            كابتن <span style={{ color: '#d4af37' }}>{coach.fullName}</span>
          </h1>
          {coach.title && <p style={{ color: '#d4af37', fontWeight: 700, fontSize: 17, margin: '0 0 20px' }}>{coach.title}</p>}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {coach.yearsExperience != null && <StatBadge icon="⏱️" label={`${coach.yearsExperience}+ سنة خبرة`} />}
            {coach.playersTrained != null && <StatBadge icon="👥" label={`${coach.playersTrained}+ لاعب تم تدريبهم`} />}
            {coach.belts && <StatBadge icon="🥋" label={coach.belts} />}
          </div>

          {(coach.whatsapp || coach.facebookUrl || coach.instagramUrl) && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
              {coach.whatsapp && (
                <a
                  href={`https://wa.me/${coach.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-btn"
                  style={contactBtnStyle('#25D366')}
                >
                  💬 واتساب
                </a>
              )}
              {coach.facebookUrl && (
                <a href={coach.facebookUrl} target="_blank" rel="noopener noreferrer" className="contact-btn" style={contactBtnStyle('#1877F2')}>
                  📘 فيسبوك
                </a>
              )}
              {coach.instagramUrl && (
                <a href={coach.instagramUrl} target="_blank" rel="noopener noreferrer" className="contact-btn" style={contactBtnStyle('#E4405F')}>
                  📷 انستجرام
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {coach.bio && (
        <section className="reveal" style={{ maxWidth: 800, margin: '0 auto', padding: '30px 24px', textAlign: 'center' }}>
          <h2 style={sectionTitleStyle}>نبذة عن المدرب</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: 16 }}>{coach.bio}</p>
        </section>
      )}

      {(coach.coachSports.length > 0 || coach.trainingSchedule) && (
        <section className="reveal" style={{ maxWidth: 900, margin: '0 auto', padding: '30px 24px', display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {coach.coachSports.length > 0 && (
            <div style={infoCardStyle}>
              <p style={infoCardTitleStyle}>🥊 الرياضات التي يدربها</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
                {coach.coachSports.map((cs) => (
                  <span key={cs.sport.id} style={{ color: '#0f172a', background: '#d4af37', fontSize: 13, fontWeight: 800, padding: '5px 12px', borderRadius: 6 }}>
                    {cs.sport.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {coach.trainingSchedule && (
            <div style={infoCardStyle}>
              <p style={infoCardTitleStyle}>🗓️ مواعيد التدريب</p>
              <p style={{ color: '#e2e8f0', marginTop: 10, fontSize: 14.5 }}>{coach.trainingSchedule}</p>
            </div>
          )}
        </section>
      )}

      {coach.achievements.length > 0 && (
        <section className="reveal" style={{ maxWidth: 850, margin: '0 auto', padding: '30px 24px' }}>
          <h2 style={{ ...sectionTitleStyle, textAlign: 'center' }}>🏆 البطولات والإنجازات</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 24 }}>
            {coach.achievements.map((a) => (
              <div
                key={a.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 14,
                  padding: '16px 18px',
                }}
              >
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, margin: 0 }}>{a.title}</p>
                {a.year && <span style={{ color: '#d4af37', fontWeight: 900, fontSize: 14 }}>{a.year}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {coach.certificates.length > 0 && (
        <section className="reveal" style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px' }}>
          <h2 style={{ ...sectionTitleStyle, textAlign: 'center' }}>📜 الشهادات</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 24 }}>
            {coach.certificates.map((c) => (
              <div key={c.id} style={{ textAlign: 'center' }}>
                {c.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(212,175,55,0.3)', marginBottom: 8 }}
                  />
                )}
                <p style={{ color: '#e2e8f0', fontSize: 13.5, fontWeight: 600 }}>{c.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {coach.galleryItems.length > 0 && (
        <section className="reveal" style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px 100px' }}>
          <h2 style={{ ...sectionTitleStyle, textAlign: 'center' }}>📸 معرض الصور والفيديوهات</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
            {coach.galleryItems.map((g) => (
              <div
                key={g.id}
                className="gallery-item"
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid rgba(212,175,55,0.3)',
                  position: 'relative',
                  aspectRatio: '4/3',
                  background: '#1e293b',
                }}
              >
                {g.type === 'IMAGE' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.url} alt={g.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 40, textDecoration: 'none' }}
                  >
                    ▶️
                  </a>
                )}
                {g.caption && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.85)', padding: '6px 10px', fontSize: 12, color: '#e2e8f0' }}>
                    {g.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      style={{
        background: 'rgba(212,175,55,0.1)',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: 10,
        padding: '8px 16px',
        fontSize: 13.5,
        color: '#e2e8f0',
        fontWeight: 700,
      }}
    >
      {icon} {label}
    </span>
  )
}

function contactBtnStyle(color: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 20px',
    borderRadius: 10,
    background: `${color}20`,
    border: `1px solid ${color}60`,
    color: '#f8fafc',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 14,
  }
}

const pageBg: React.CSSProperties = {
  background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 45%, #020617 100%)',
  minHeight: '100vh',
  fontFamily: "'Tajawal', sans-serif",
  color: '#e2e8f0',
  overflowX: 'hidden',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 900,
  color: '#f8fafc',
  margin: 0,
}

const infoCardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.7)',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  borderRadius: 16,
  padding: 22,
  textAlign: 'center',
  minWidth: 240,
  flex: 1,
}

const infoCardTitleStyle: React.CSSProperties = {
  color: '#d4af37',
  fontWeight: 800,
  fontSize: 15,
  margin: 0,
}