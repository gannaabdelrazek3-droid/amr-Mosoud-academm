'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface MediaItem {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption: string | null
}

interface Participant {
  id: string
  name: string
  result: string | null
}

interface TournamentDetail {
  id: string
  name: string
  date: string
  location: string | null
  description: string | null
  media: MediaItem[]
  participants: Participant[]
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function TournamentDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [tournament, setTournament] = useState<TournamentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/tournaments/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data?.tournament) setTournament(data.tournament)
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

  if (notFound || !tournament) {
    return (
      <div style={pageBg}>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <p style={{ color: '#e2e8f0', fontSize: 18, marginBottom: 20 }}>البطولة غير موجودة</p>
          <Link href="/tournaments" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 700 }}>
            ← العودة لصفحة البطولات
          </Link>
        </div>
      </div>
    )
  }

  const imageCount = tournament.media.filter((m) => m.type === 'IMAGE').length
  const videoCount = tournament.media.filter((m) => m.type === 'VIDEO').length

  return (
    <div style={pageBg}>
      <style jsx global>{`
        .gallery-item {
          transition: transform 0.3s ease;
        }
        .gallery-item:has(img):hover {
          transform: scale(1.04);
          cursor: pointer;
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
        <Link href="/tournaments" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          ← كل البطولات
        </Link>
      </nav>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f8fafc', margin: '0 0 16px' }}>{tournament.name}</h1>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <StatBadge icon="📅" label={new Date(tournament.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })} />
          {tournament.location && <StatBadge icon="📍" label={tournament.location} />}
          <StatBadge icon="📸" label={`${imageCount} صورة`} />
          <StatBadge icon="🎥" label={`${videoCount} فيديو`} />
        </div>
        {tournament.description && (
          <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: 16, maxWidth: 700, margin: '0 auto' }}>{tournament.description}</p>
        )}
      </section>

      {tournament.participants.length > 0 && (
        <section style={{ maxWidth: 850, margin: '0 auto', padding: '30px 24px' }}>
          <h2 style={sectionTitleStyle}>🏅 اللاعبون المشاركون / الفائزون</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 24 }}>
            {tournament.participants.map((p) => (
              <div
                key={p.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 14,
                  padding: '14px 18px',
                }}
              >
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, margin: 0 }}>{p.name}</p>
                {p.result && <span style={{ color: '#d4af37', fontWeight: 800, fontSize: 13 }}>{p.result}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {tournament.media.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px 100px' }}>
          <h2 style={{ ...sectionTitleStyle, textAlign: 'center' }}>📸 صور وفيديوهات البطولة</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
            {tournament.media.map((m) => (
              <div
                key={m.id}
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
                {m.type === 'IMAGE' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : getYouTubeEmbedUrl(m.url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(m.url)!}
                    title={m.caption || 'فيديو'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={m.url}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
                  />
                )}
                {m.caption && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.85)', padding: '6px 10px', fontSize: 12, color: '#e2e8f0' }}>
                    {m.caption}
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