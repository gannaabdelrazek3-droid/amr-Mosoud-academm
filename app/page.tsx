'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface AcademyInfo {
  aboutText: string | null
  trainingSchedule: string | null
  activitiesText: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  mapUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
}

interface NewsItem {
  id: string
  title: string
  content: string | null
  imageUrl: string | null
}

const captainAchievements = [
  { title: 'بطولة العالم للساندا', year: '2012', place: 'الصين', sport: 'كونغ فو ساندا' },
  { title: 'بطولة العرب للساندا', year: '2014', place: 'تونس', sport: 'كونغ فو ساندا' },
  { title: 'بطولة إفريقيا للساندا', year: '2016', place: 'مصر', sport: 'كونغ فو ساندا' },
  { title: 'بطل مصر للمحترفين - كيك بوكسينج', year: '2012', place: '', sport: 'كيك بوكسينج' },
  { title: 'بطل ISKA وحامل حزام اللقب - كيك بوكسينج', year: '2013', place: '', sport: 'كيك بوكسينج' },
  { title: 'بطل العرب - كيك بوكسينج', year: '2014', place: '', sport: 'كيك بوكسينج' },
  { title: 'بطل العرب - مواي تاي', year: '2012', place: '', sport: 'مواي تاي' },
  { title: 'بطل إفريقيا - مواي تاي', year: '2016', place: '', sport: 'مواي تاي' },
]

const players = [
  {
    name: 'أحمد لطفي الجزيري',
    image: '/images/ahmad-lotfy.jpeg',
    sport: 'كونغ فو ساندا',
    achievements: [
      'لاعب نادي اتحاد الشرطة',
      'بطل جمهورية مناطق ساندا',
      'بطل جمهورية أندية ساندا',
    ],
  },
  {
    name: 'عبدالله محمد صالح',
    image: '/images/abdullah-saleh.jpeg',
    sport: 'مواي تاي',
    achievements: [
      'المركز الأول - بطولة إفريقيا للأندية',
      'المركز الأول - بطولة السفير التايلاندي للمواي تاي',
      'المركز الأول - تصفيات منتخب مصر ساندا',
    ],
  },
  {
    name: 'محمود محمد عبدالرؤوف',
    image: '/images/mahmoud-abdelraouf.jpeg',
    sport: 'MMA',
    achievements: ['فوز على لاعب روسي - منظمة EMA للـ MMA'],
  },
  {
    name: 'محمد أشرف مرسال',
    image: '/images/mohamed-ashraf.jpeg',
    sport: 'كيك بوكسينج',
    achievements: [
      'المركز الأول عالميًا - منتخبات كيك بوكسينج (مصر)',
      'المركز الأول أفريقيًا - منتخبات كيك بوكسينج (مصر)',
      'المركز الأول عالميًا - منتخبات (الإمارات)',
    ],
  },
  {
    name: 'إسلام محمد محمد الشيت',
    image: '/images/eslam-elshet.jpeg',
    sport: 'كونغ فو ساندا',
    achievements: ['المركز الثاني - تصفيات منتخب مصر ساندا'],
  },
  {
    name: 'سلمى أمير محمد السعيد',
    image: '/images/salma-amer.jpeg',
    sport: 'كونغ فو ساندا',
    achievements: ['المركز الثالث - تصفيات منتخب مصر ساندا'],
  },
  {
    name: 'محمود شمس الدين فرحات',
    image: '/images/mahmoud-shams.jpeg',
    sport: 'كونغ فو ساندا',
    achievements: [
      'لاعب منتخب مصر ساندا',
      'بطل جمهورية ساندا',
      'بطل جمهورية كيك بوكسينج',
      'بطل السعودية للملاكمة',
    ],
  },
  {
    name: 'أحمد حسني زكي',
    image: '/images/ahmad-hosny.jpeg',
    sport: 'كونغ فو ساندا',
    achievements: [
      'لاعب منتخب مصر',
      'بطل جمهورية ساندا',
      'بطل جمهورية كيك بوكسينج',
      'بطل السعودية للملاكمة',
    ],
  },
  {
    name: 'أحمد محمد عبدالرؤوف',
    image: '/images/ahmad-abdelraouf.jpeg',
    sport: 'MMA',
    achievements: ['بطل MMA - منظمة Warrior (الإمارات)'],
  },
]

const sports = [
  { name: 'الجمباز', icon: '🤸' },
  { name: 'كونغ فو ساندا', icon: '🥋' },
  { name: 'كيك بوكسينج', icon: '🥊' },
  { name: 'MMA', icon: '🤼' },
  { name: 'مواي تاي', icon: '🥋' },
  { name: 'ملاكمة', icon: '🥊' },
  { name: 'كاراتيه', icon: '🥋' },
  { name: 'سباحة', icon: '🏊' },
  { name: 'فتنس', icon: '💪' },
  { name: 'زومبا', icon: '💃' },
  { name: 'برامج تغذية', icon: '🥗' },
]

const aboutCards = [
  {
    icon: '🎓',
    title: 'إشراف أكاديمي',
    text: 'بإشراف مباشر من دكتور متخصص في علوم الرياضة وبطل عالمي سابق.',
  },
  {
    icon: '🥋',
    title: 'تدريب متكامل',
    text: 'نجمع بين التدريب الأكاديمي والعملي في رياضات القتال والجمباز واللياقة.',
  },
  {
    icon: '🏆',
    title: 'صناعة الأبطال',
    text: 'نصنع أبطال المستقبل بأعلى معايير الاحتراف داخل وخارج مصر.',
  },
]

const navLinks = [
  { href: '#home', label: 'الرئيسية' },
  { href: '#about', label: 'عن الأكاديمية' },
  { href: '#sports', label: 'الرياضات' },
  { href: '/coaches', label: 'المدربون' },
  { href: '/tournaments', label: 'البطولات' },
  { href: '#players', label: 'الأبطال' },
  { href: '/gallery', label: 'معرض الصور' },
  { href: '/featured-players', label: 'اللاعبون المميزون' },
  { href: '/nutrition-programs', label: 'البرامج الغذائية' },
  { href: '/login', label: 'تسجيل الدخول' },
]

const filterOptions = ['الكل', 'كونغ فو ساندا', 'كيك بوكسينج', 'مواي تاي', 'MMA']

export default function HomePage() {
  const [openYear, setOpenYear] = useState<number | null>(null)
  const [playerFilter, setPlayerFilter] = useState('الكل')
  const [academyInfo, setAcademyInfo] = useState<AcademyInfo | null>(null)
  const [newsList, setNewsList] = useState<NewsItem[]>([])

  useEffect(() => {
    fetch('/api/academy-public')
      .then((res) => res.json())
      .then((data) => {
        if (data.info) setAcademyInfo(data.info)
        if (data.news) setNewsList(data.news)
      })
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
  }, [newsList, academyInfo])

  const filteredPlayers = playerFilter === 'الكل' ? players : players.filter((p) => p.sport === playerFilter)

  return (
    <div
      className="home-page"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 45%, #020617 100%)',
        minHeight: '100vh',
        fontFamily: "'Tajawal', sans-serif",
        color: '#e2e8f0',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <style jsx global>{`
        .floating-interactive-btn:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 45px rgba(0,0,0,0.8), 0 0 35px rgba(212, 175, 55, 0.7);
        }

        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .home-navbar {
          padding: 18px 40px;
        }
        .nav-links-desktop {
          display: flex;
          gap: 22px;
          align-items: center;
          flex-wrap: wrap;
        }
        .nav-links-desktop a {
          color: #e2e8f0;
          text-decoration: none;
          font-weight: 700;
          font-size: 14.5px;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-links-desktop a:hover {
          color: #d4af37;
        }
        .nav-login-link {
          padding: 9px 20px !important;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 8px;
          color: #d4af37 !important;
        }
        .nav-toggle-btn {
          display: none;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 50px;
          align-items: center;
          max-width: 1300px;
          margin: 0 auto;
          padding: 80px 50px 100px;
        }
        .hero-text h1 {
          font-size: 58px;
        }
        .hero-text p {
          font-size: 19px;
        }
        .hero-btns {
          display: flex;
          gap: 16px;
          margin-top: 34px;
          flex-wrap: wrap;
        }
        .hero-btn-primary {
          padding: 17px 40px;
          background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
          color: #0f172a;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 900;
          font-size: 16px;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.35);
          border: none;
          cursor: pointer;
          transition: transform 0.25s ease;
        }
        .hero-btn-primary:hover {
          transform: translateY(-4px);
        }
        .hero-btn-secondary {
          padding: 17px 40px;
          background: transparent;
          color: #f8fafc;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 900;
          font-size: 16px;
          border: 1.5px solid rgba(212, 175, 55, 0.4);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .hero-btn-secondary:hover {
          background: rgba(212, 175, 55, 0.1);
          transform: translateY(-4px);
        }

        .hero-photo-wrap {
          position: relative;
          width: 100%;
          height: 480px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.55);
          border: 1px solid rgba(212, 175, 55, 0.25);
        }
        .hero-photo-glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 70%);
          z-index: 0;
          filter: blur(20px);
        }

        .home-section-title {
          font-size: 34px;
        }
        .home-players-title {
          font-size: 38px;
        }
        .floating-interactive-btn {
          bottom: 35px;
          left: 35px;
          padding: 16px 32px;
          font-size: 16px;
        }

        .timeline-item {
          cursor: pointer;
        }
        .timeline-details {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s ease;
        }
        .timeline-details.open {
          max-height: 200px;
        }

        .filter-btn {
          padding: 10px 22px;
          border-radius: 30px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: transparent;
          color: #94a3b8;
          font-family: 'Tajawal', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn.active {
          background: #d4af37;
          color: #0f172a;
          border-color: #d4af37;
        }

        .sport-card-unified {
          background: rgba(30, 41, 59, 0.55);
          border: 1px solid rgba(212, 175, 55, 0.18);
          border-radius: 20px;
          padding: 42px 20px;
          text-align: center;
          transition: transform 0.25s ease, border-color 0.25s ease;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .sport-card-unified:hover {
          transform: translateY(-6px);
          border-color: rgba(212, 175, 55, 0.55);
        }

        .player-card-unified {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
          border: 1px solid rgba(212, 175, 55, 0.22);
          border-radius: 24px;
          padding: 34px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          min-height: 340px;
        }

        @media (max-width: 1050px) {
          .nav-links-desktop {
            display: none;
          }
          .nav-toggle-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(212, 175, 55, 0.15);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 8px;
            color: #d4af37;
            padding: 8px 14px;
            font-size: 20px;
            cursor: pointer;
          }
        }

        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
            padding: 40px 20px 60px;
            text-align: center;
          }
          .hero-photo-wrap {
            height: 320px;
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .home-navbar {
            padding: 10px 14px;
          }
          .home-navbar strong {
            font-size: 12px !important;
          }
          .home-navbar span:first-child {
            font-size: 18px !important;
          }
          .hero-text h1 {
            font-size: 28px !important;
          }
          .hero-text p {
            font-size: 13px !important;
            line-height: 1.6 !important;
          }
          .hero-btn-primary,
          .hero-btn-secondary {
            padding: 12px 24px !important;
            font-size: 13px !important;
          }
          .hero-photo-wrap {
            height: 220px !important;
          }
          .home-section-title {
            font-size: 20px !important;
          }
          .home-players-title {
            font-size: 20px !important;
          }
          .home-section {
            padding: 40px 14px !important;
          }
          .sport-card-unified {
            padding: 26px 14px !important;
            min-height: 130px !important;
          }
          .player-card-unified {
            padding: 20px !important;
            min-height: auto !important;
          }
          .filter-btn {
            padding: 7px 14px !important;
            font-size: 11.5px !important;
          }
          .floating-interactive-btn {
            bottom: 12px !important;
            left: 12px !important;
            padding: 8px 16px !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* زر عائم - تسجيل الدخول */}
      <Link
        href="/login"
        className="floating-interactive-btn"
        style={{
          position: 'fixed',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
          color: '#0f172a',
          borderRadius: 50,
          textDecoration: 'none',
          fontWeight: 900,
          boxShadow: '0 12px 35px rgba(0,0,0,0.7), 0 0 25px rgba(212, 175, 55, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <span style={{ fontSize: 18 }}>⚡</span> تسجيل الدخول
      </Link>

      {/* Navbar */}
      <nav
        id="home"
        className="home-navbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(212, 175, 55, 0.12)',
          background: 'rgba(15, 23, 42, 0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 26, filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.6))' }}>🥇</span>
          <strong style={{ color: '#f8fafc', fontSize: 20, letterSpacing: 0.5 }}>أكاديمية الكابتن عمرو مسعود</strong>
        </div>

        <div className="nav-links-desktop">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={link.href === '/login' ? 'nav-login-link' : ''}>
              {link.label}
            </a>
          ))}
        </div>

        <button
          className="nav-toggle-btn"
          onClick={() => {
            const panel = document.getElementById('mobile-nav-panel')
            if (panel) panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex'
          }}
        >
          ☰
        </button>
      </nav>

      <div
        id="mobile-nav-panel"
        style={{
          display: 'none',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.98)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => {
              const panel = document.getElementById('mobile-nav-panel')
              if (panel) panel.style.display = 'none'
            }}
            style={{
              color: link.href === '/login' ? '#d4af37' : '#e2e8f0',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 15,
              padding: '14px 20px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Hero Section - side by side */}
      <section className="hero-grid">
        <div className="hero-text reveal">
          <div
            className="home-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 22px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: 35,
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 16 }}>🎓</span>
            <span style={{ color: '#d4af37', fontWeight: 800, letterSpacing: 1, fontSize: 14 }}>
              دكتور في كلية علوم الرياضة • خبير التدريب الاحترافي
            </span>
          </div>

          <h1 style={{ fontWeight: 900, color: '#f8fafc', margin: '0 0 22px', lineHeight: 1.15 }}>
            الكابتن <span style={{ color: '#d4af37', textShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}>عمرو مسعود</span>
          </h1>

          <p style={{ color: '#94a3b8', lineHeight: 1.9, maxWidth: 520 }}>
            لاعب منتخب مصر للساندا (2012–2016) وبطل جمهورية متعدد الألقاب في الساندا وكيك بوكسينج ومواي تاي،
            نضع بين أيديكم خبرة أكاديمية وعملية تمتد لأكثر من عشرين عامًا من البطولات والإنجازات المطلقة.
          </p>

          <div className="hero-btns">
            <a href="/register" className="hero-btn-primary">
              احجز مكانك الآن
            </a>
            <a href="#about" className="hero-btn-secondary">
              اكتشف الأكاديمية
            </a>
          </div>
        </div>

        <div className="reveal" style={{ position: 'relative' }}>
          <div className="hero-photo-glow" />
          <div className="hero-photo-wrap">
            <Image src="/images/amr-masoud.jpeg" alt="الكابتن عمرو مسعود" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* About - cards instead of paragraph */}
      <section id="about" className="home-section reveal" style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px 100px', textAlign: 'center' }}>
        <h2 className="home-section-title" style={{ color: '#f8fafc', fontWeight: 900, marginBottom: 50 }}>
          عن <span style={{ color: '#d4af37' }}>الأكاديمية</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 26 }}>
          {aboutCards.map((card) => (
            <div
              key={card.title}
              style={{
                background: 'rgba(30, 41, 59, 0.55)',
                border: '1px solid rgba(212, 175, 55, 0.18)',
                borderRadius: 20,
                padding: '36px 26px',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{card.icon}</div>
              <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18, margin: '0 0 12px' }}>{card.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14.5, margin: 0 }}>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Captain Achievements — Interactive Timeline */}
      <section id="achievements" className="home-section reveal" style={{ maxWidth: 850, margin: '0 auto', padding: '30px 24px 100px' }}>
        <h2 className="home-section-title" style={{ textAlign: 'center', color: '#f8fafc', fontWeight: 900, marginBottom: 16 }}>
          🏆 سجل إنجازات <span style={{ color: '#d4af37' }}>الكابتن التاريخية</span>
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginBottom: 46 }}>اضغط على أي إنجاز لعرض التفاصيل</p>

        <div style={{ position: 'relative', paddingRight: 30 }}>
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: 0,
              bottom: 0,
              width: 2,
              background: 'linear-gradient(to bottom, #d4af37, rgba(212,175,55,0.08))',
            }}
          />
          {captainAchievements.map((a, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 18 }}>
              <div
                style={{
                  position: 'absolute',
                  right: -30 + 8,
                  top: 20,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#d4af37',
                  border: '3px solid #0f172a',
                  boxShadow: '0 0 10px rgba(212,175,55,0.6)',
                }}
              />
              <div
                className="timeline-item"
                onClick={() => setOpenYear(openYear === i ? null : i)}
                style={{
                  background: 'rgba(30, 41, 59, 0.55)',
                  border: '1px solid rgba(212, 175, 55, 0.18)',
                  borderRadius: 16,
                  padding: '18px 22px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#d4af37', fontWeight: 900, fontSize: 20 }}>{a.year}</span>
                    <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, margin: '4px 0 0' }}>
                      {a.title}
                    </p>
                  </div>
                  <span style={{ color: '#d4af37', fontSize: 18, transform: openYear === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                    ⌄
                  </span>
                </div>
                <div className={`timeline-details ${openYear === i ? 'open' : ''}`}>
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(212, 175, 55, 0.12)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ color: '#e2e8f0', fontSize: 14 }}>🥋 الرياضة: <strong style={{ color: '#d4af37' }}>{a.sport}</strong></span>
                    {a.place && <span style={{ color: '#e2e8f0', fontSize: 14 }}>📍 الدولة: <strong style={{ color: '#d4af37' }}>{a.place}</strong></span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sports - unified, bigger cards */}
      <section id="sports" className="home-section reveal" style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px 100px' }}>
        <h2 className="home-section-title" style={{ textAlign: 'center', color: '#f8fafc', fontWeight: 900, marginBottom: 50 }}>
          الرياضات الاحترافية بالأكاديمية
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 22 }}>
          {sports.map((sport) => (
            <div key={sport.name} className="sport-card-unified card-hover">
              <div style={{ fontSize: 46, marginBottom: 16, filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.35))' }}>
                {sport.icon}
              </div>
              <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 18, margin: 0 }}>{sport.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Players with filtering - unified, bigger cards */}
      <section id="players" className="home-section reveal" style={{ maxWidth: 1300, margin: '0 auto', padding: '30px 24px 110px' }}>
        <h2 className="home-players-title" style={{ textAlign: 'center', color: '#f8fafc', fontWeight: 900, marginBottom: 16 }}>
          ⭐ نجوم وأبطال <span style={{ color: '#d4af37' }}>الأكاديمية</span> الأساطير
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 16, marginBottom: 40 }}>
          نفتخر بصناعة الأبطال ومنصات التتويج المحلية والعالمية
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 46 }}>
          {filterOptions.map((f) => (
            <button
              key={f}
              className={`filter-btn ${playerFilter === f ? 'active' : ''}`}
              onClick={() => setPlayerFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 26 }}>
          {filteredPlayers.map((player) => (
            <div key={player.name} className="player-card-unified card-hover">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    border: '3px solid #d4af37',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <Image src={player.image} alt={player.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 21, margin: '0 0 8px' }}>{player.name}</h3>
                  <span style={{ color: '#0f172a', background: '#d4af37', fontSize: 12.5, fontWeight: 800, padding: '5px 12px', borderRadius: 6, display: 'inline-block' }}>
                    {player.sport} 🏆
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 14, padding: 20, flex: 1 }}>
                <p style={{ color: '#d4af37', fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>🎖️ إنجازات البطل:</p>
                <ul style={{ margin: 0, paddingRight: 18, color: '#e2e8f0', fontSize: 14.5, lineHeight: 1.9 }}>
                  {player.achievements.map((ach, i) => (
                    <li key={i} style={{ marginBottom: 6, fontWeight: 600 }}>{ach}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News + Contact Info */}
      {(newsList.length > 0 || academyInfo) && (
        <section id="news" className="home-section reveal" style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px 100px' }}>
          {newsList.length > 0 && (
            <>
              <h2 className="home-section-title" style={{ textAlign: 'center', color: '#f8fafc', fontWeight: 900, marginBottom: 44 }}>
                📰 أحدث <span style={{ color: '#d4af37' }}>الأخبار</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22, marginBottom: 70 }}>
                {newsList.map((n) => (
                  <div
                    key={n.id}
                    className="card-hover"
                    style={{
                      background: 'rgba(30, 41, 59, 0.55)',
                      border: '1px solid rgba(212, 175, 55, 0.18)',
                      borderRadius: 18,
                      overflow: 'hidden',
                    }}
                  >
                    {n.imageUrl && (
                      <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={n.imageUrl}
                          alt={n.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}
                    <div style={{ padding: 20 }}>
                      <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16, margin: '0 0 8px' }}>{n.title}</h3>
                      {n.content && <p style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{n.content}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {academyInfo && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
              {academyInfo.trainingSchedule && (
                <div style={{ background: 'rgba(30, 41, 59, 0.55)', border: '1px solid rgba(212, 175, 55, 0.18)', borderRadius: 18, padding: 24 }}>
                  <p style={{ color: '#d4af37', fontWeight: 800, fontSize: 15, margin: '0 0 10px' }}>🗓️ مواعيد التمرين</p>
                  <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.8, margin: 0 }}>{academyInfo.trainingSchedule}</p>
                </div>
              )}
              {academyInfo.activitiesText && (
                <div style={{ background: 'rgba(30, 41, 59, 0.55)', border: '1px solid rgba(212, 175, 55, 0.18)', borderRadius: 18, padding: 24 }}>
                  <p style={{ color: '#d4af37', fontWeight: 800, fontSize: 15, margin: '0 0 10px' }}>🥋 الأنشطة الموجودة</p>
                  <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.8, margin: 0 }}>{academyInfo.activitiesText}</p>
                </div>
              )}
              {(academyInfo.phone || academyInfo.whatsapp || academyInfo.email || academyInfo.address) && (
                <div style={{ background: 'rgba(30, 41, 59, 0.55)', border: '1px solid rgba(212, 175, 55, 0.18)', borderRadius: 18, padding: 24 }}>
                  <p style={{ color: '#d4af37', fontWeight: 800, fontSize: 15, margin: '0 0 10px' }}>📞 بيانات التواصل</p>
                  {academyInfo.phone && <p style={{ color: '#e2e8f0', fontSize: 14, margin: '0 0 6px' }}>☎️ {academyInfo.phone}</p>}
                  {academyInfo.whatsapp && <p style={{ color: '#e2e8f0', fontSize: 14, margin: '0 0 6px' }}>💬 {academyInfo.whatsapp}</p>}
                  {academyInfo.email && <p style={{ color: '#e2e8f0', fontSize: 14, margin: '0 0 6px' }}>✉️ {academyInfo.email}</p>}
                  {academyInfo.address && <p style={{ color: '#e2e8f0', fontSize: 14, margin: 0 }}>📍 {academyInfo.address}</p>}
                </div>
              )}
            </div>
          )}

          {academyInfo?.mapUrl && (
            <div style={{ marginTop: 32, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.18)' }}>
              <iframe src={academyInfo.mapUrl} width="100%" height="300" style={{ border: 0 }} loading="lazy" title="موقع الأكاديمية" />
            </div>
          )}
        </section>
      )}

      {/* Footer CTA */}
      <section
        className="reveal"
        style={{ textAlign: 'center', padding: '80px 24px 100px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}
      >
        <h3 style={{ color: '#f8fafc', fontSize: 30, fontWeight: 900, marginBottom: 18 }}>ابدأ رحلتك نحو البطولات الآن</h3>
        <p style={{ color: '#94a3b8', marginBottom: 34, fontSize: 17 }}>انضم لأكاديمية الدكتور عمرو مسعود واصنع مجدك الرياضي</p>
        <Link
          href="/register"
          style={{
            display: 'inline-block',
            padding: '17px 52px',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
            color: '#0f172a',
            borderRadius: 14,
            textDecoration: 'none',
            fontWeight: 900,
            fontSize: 18,
            boxShadow: '0 8px 30px rgba(212, 175, 55, 0.4)',
          }}
        >
          سجّل الآن في الأكاديمية
        </Link>
      </section>
    </div>
  )
}