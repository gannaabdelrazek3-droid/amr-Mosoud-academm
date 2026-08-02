'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const categoryLabels: Record<string, string> = {
  TOURNAMENTS: 'بطولات',
  TRAINING: 'تدريبات',
  BELT_TESTS: 'اختبارات أحزمة',
  CAMPS: 'معسكرات',
  PARTIES: 'حفلات',
}

interface MediaItem {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption: string | null
}

interface AlbumDetail {
  id: string
  title: string
  category: string
  items: MediaItem[]
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function AlbumDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [album, setAlbum] = useState<AlbumDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/gallery/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data?.album) setAlbum(data.album)
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

  if (notFound || !album) {
    return (
      <div style={pageBg}>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <p style={{ color: '#e2e8f0', fontSize: 18, marginBottom: 20 }}>الألبوم غير موجود</p>
          <Link href="/gallery" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 700 }}>
            ← العودة للمعرض
          </Link>
        </div>
      </div>
    )
  }

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
        <Link href="/gallery" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          ← كل الألبومات
        </Link>
      </nav>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 20px', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: '#d4af37', color: '#0f172a', fontSize: 12.5, fontWeight: 800, padding: '5px 14px', borderRadius: 8, marginBottom: 14 }}>
          {categoryLabels[album.category] || album.category}
        </span>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f8fafc', margin: '0 0 8px' }}>{album.title}</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>{album.items.length} ملف</p>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {album.items.map((it) => (
            <div
              key={it.id}
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
              {it.type === 'IMAGE' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.url} alt={it.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : getYouTubeEmbedUrl(it.url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(it.url)!}
                  title={it.caption || 'فيديو'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={it.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
              )}
              {it.caption && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.85)', padding: '6px 10px', fontSize: 12, color: '#e2e8f0' }}>
                  {it.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const pageBg: React.CSSProperties = {
  background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 45%, #020617 100%)',
  minHeight: '100vh',
  fontFamily: "'Tajawal', sans-serif",
  color: '#e2e8f0',
  overflowX: 'hidden',
}