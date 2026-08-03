'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const categories = [
  { value: 'TOURNAMENTS', label: 'بطولات', icon: '🏆' },
  { value: 'TRAINING', label: 'تدريبات', icon: '🥋' },
  { value: 'BELT_TESTS', label: 'اختبارات أحزمة', icon: '🎖️' },
  { value: 'CAMPS', label: 'معسكرات', icon: '⛺' },
  { value: 'PARTIES', label: 'حفلات', icon: '🎉' },
]

interface Album {
  id: string
  title: string
  category: string
  coverUrl: string | null
  items: { id: string; type: 'IMAGE' | 'VIDEO' }[]
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('الكل')

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.albums) setAlbums(data.albums)
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
  }, [albums, activeCategory])

  const filteredAlbums = activeCategory === 'الكل' ? albums : albums.filter((a) => a.category === activeCategory)

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
        .album-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .album-card:hover {
          transform: translateY(-8px);
          border-color: rgba(212, 175, 55, 0.7) !important;
          box-shadow: 0 20px 45px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.25) !important;
        }
        .cat-filter-btn {
          padding: 10px 20px;
          border-radius: 30px;
          border: 1px solid rgba(212, 175, 55, 0.35);
          background: transparent;
          color: #94a3b8;
          font-family: 'Tajawal', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cat-filter-btn.active {
          background: #d4af37;
          color: #0f172a;
          border-color: #d4af37;
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
          <span style={{ fontSize: 16 }}>📸</span>
          <span style={{ color: '#d4af37', fontWeight: 800, fontSize: 14 }}>لحظات لا تُنسى</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f8fafc', margin: '0 0 16px' }}>
          معرض <span style={{ color: '#d4af37' }}>الصور والفيديوهات</span>
        </h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 16 }}>
          لحظات من البطولات، التدريبات، اختبارات الأحزمة، المعسكرات والحفلات
        </p>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            className={`cat-filter-btn ${activeCategory === 'الكل' ? 'active' : ''}`}
            onClick={() => setActiveCategory('الكل')}
          >
            الكل
          </button>
          {categories.map((c) => (
            <button
              key={c.value}
              className={`cat-filter-btn ${activeCategory === c.value ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.value)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 24px 100px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>جارٍ تحميل الألبومات...</p>
        ) : filteredAlbums.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>لا توجد ألبومات في هذا القسم حالياً</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
            {filteredAlbums.map((a, idx) => {
              const cat = categories.find((c) => c.value === a.category)
              return (
                <Link
                  key={a.id}
                  href={`/gallery/${a.id}`}
                  className="album-card reveal"
                  style={{
                    textDecoration: 'none',
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: 18,
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                    display: 'block',
                    transitionDelay: `${idx * 0.05}s`,
                  }}
                >
<div style={{ width: '100%', aspectRatio: '1 / 1', background: '#1e293b', position: 'relative' }}>                    {a.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.coverUrl} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                        {cat?.icon || '📷'}
                      </div>
                    )}
                    <span style={{ position: 'absolute', top: 10, right: 10, background: '#d4af37', color: '#0f172a', fontSize: 11.5, fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}>
                      {cat?.icon} {cat?.label}
                    </span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16, margin: '0 0 6px' }}>{a.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: 12.5, margin: 0 }}>{a.items.length} ملف</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}