'use client'

import Link from 'next/link'
import Image from 'next/image'

const captainAchievements = [
  { title: 'بطولة العالم للساندا', year: '2012', place: 'الصين' },
  { title: 'بطولة العرب للساندا', year: '2014', place: 'تونس' },
  { title: 'بطولة اليورو للساندا', year: '2015', place: 'موسكو' },
  { title: 'بطولة إفريقيا للساندا', year: '2016', place: 'مصر' },
  { title: 'بطل مصر للمحترفين - كيك بوكسينج', year: '2012', place: '' },
  { title: 'بطل ISKA وحامل حزام اللقب - كيك بوكسينج', year: '2013', place: '' },
  { title: 'بطل العرب - كيك بوكسينج', year: '2014', place: '' },
  { title: 'بطل العرب - مواي تاي', year: '2012', place: '' },
  { title: 'بطل إفريقيا - مواي تاي', year: '2016', place: '' },
]

const players = [
  {
    name: 'عبدالله محمد صالح',
    image: '/images/abdullah-saleh.jpeg',
    achievements: [
      'المركز الأول - بطولة إفريقيا للأندية',
      'المركز الأول - بطولة السفير التايلاندي للمواي تاي',
      'المركز الأول - تصفيات منتخب مصر ساندا',
    ],
  },
  {
    name: 'محمود محمد عبدالرؤوف',
    image: '/images/mahmoud-abdelraouf.jpeg',
    achievements: ['فوز على لاعب روسي - منظمة EMA للـ MMA'],
  },
  {
    name: 'محمد أشرف مرسال',
    image: '/images/mohamed-ashraf.jpeg',
    achievements: [
      'المركز الأول عالميًا - منتخبات كيك بوكسينج (مصر)',
      'المركز الأول أفريقيًا - منتخبات كيك بوكسينج (مصر)',
      'المركز الأول عالميًا - منتخبات (الإمارات)',
    ],
  },
  {
    name: 'إسلام محمد محمد الشيت',
    image: '/images/eslam-elshet.jpeg',
    achievements: ['المركز الثاني - تصفيات منتخب مصر ساندا'],
  },
  {
    name: 'سلمى أمير محمد السعيد',
    image: '/images/salma-amer.jpeg',
    achievements: ['المركز الثالث - تصفيات منتخب مصر ساندا'],
  },
  {
    name: 'محمود شمس الدين فرحات',
    image: '/images/mahmoud-shams.jpeg',
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
    achievements: ['بطل MMA - منظمة Warrior (الإمارات)'],
  },
]

const sports = [
  { name: 'الجمباز', icon: '🤸' },
  { name: 'كونغ فو ساندا', icon: '🥋' },
  { name: 'كيك بوكسينج', icon: '🥊' },
  { name: 'MMA', icon: '🤼' },
]

export default function HomePage() {
  return (
    <div
      style={{
        background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 45%, #020617 100%)',
        minHeight: '100vh',
        fontFamily: "'Tajawal', sans-serif",
        color: '#e2e8f0',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* زر عائم تفاعلي يتحرك ويبرز بسلاسة تامة أول ما تقفي عليه */}
      <Link
        href="/login"
        className="floating-interactive-btn"
        style={{
          position: 'fixed',
          bottom: '35px',
          left: '35px',
          zIndex: 99999,
          padding: '16px 32px',
          background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
          color: '#0f172a',
          borderRadius: 50,
          textDecoration: 'none',
          fontWeight: 900,
          fontSize: 16,
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

      <style jsx global>{`
        .floating-interactive-btn:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 45px rgba(0,0,0,0.8), 0 0 35px rgba(212, 175, 55, 0.7);
        }
      `}</style>

      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '22px 50px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 30, filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.6))' }}>🥇</span>
          <strong style={{ color: '#f8fafc', fontSize: 20, letterSpacing: 0.5 }}>أكاديمية الكابتن عمرو مسعود</strong>
        </div>
        <Link
          href="/login"
          style={{
            padding: '10px 28px',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
            color: '#0f172a',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 800,
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
          }}
        >
          تسجيل الدخول
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '90px 24px 70px', maxWidth: 1000, margin: '0 auto' }}>
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
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)',
          }}
        >
          <span style={{ fontSize: 16 }}>🎓</span>
          <span style={{ color: '#d4af37', fontWeight: 800, letterSpacing: 1, fontSize: 15 }}>
            دكتور في كلية علوم الرياضة • خبير التدريب الاحترافي
          </span>
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 900, color: '#f8fafc', margin: '0 0 20px', lineHeight: 1.2 }}>
          الكابتن <span style={{ color: '#d4af37', textShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}>عمرو مسعود</span>
        </h1>
        
        <p style={{ fontSize: 19, color: '#94a3b8', maxWidth: 750, margin: '0 auto 40px', lineHeight: 1.8 }}>
          لاعب منتخب مصر للساندا (2012–2016) وبطل جمهورية متعدد الألقاب في الساندا وكيك بوكسينج ومواي تاي،
          نضع بين أيديكم خبرة أكاديمية وعملية تمتد لأكثر من عشرين عامًا من البطولات والإنجازات المطلقة.
        </p>

        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 30px' }}>
          <div
            style={{
              position: 'absolute',
              inset: -8,
              background: 'linear-gradient(135deg, #d4af37, #1e293b, #d4af37)',
              borderRadius: '50%',
              zIndex: 0,
              filter: 'blur(15px)',
              opacity: 0.8,
            }}
          />
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              position: 'relative',
              zIndex: 1,
              border: '5px solid #d4af37',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
            }}
          >
            <Image src="/images/amr-masoud.jpeg" alt="الكابتن عمرو مسعود" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* Captain Achievements */}
      <section style={{ maxWidth: 1150, margin: '0 auto', padding: '20px 24px 80px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 32, fontWeight: 900, marginBottom: 40 }}>
          🏆 سجل إنجازات <span style={{ color: '#d4af37' }}>الكابتن التاريخية</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22 }}>
          {captainAchievements.map((a, i) => (
            <div
              key={i}
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 18,
                padding: 26,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 5,
                  height: '100%',
                  background: 'linear-gradient(to bottom, #d4af37, #aa7c11)',
                }}
              />
              <span style={{ color: '#d4af37', fontWeight: 900, fontSize: 26, display: 'block', marginBottom: 6 }}>
                {a.year}
              </span>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>{a.title}</p>
              {a.place && (
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: '#f8fafc',
                    padding: '3px 12px',
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 700,
                  }}
                >
                  📍 {a.place}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Sports */}
      <section style={{ maxWidth: 1050, margin: '0 auto', padding: '20px 24px 80px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 32, fontWeight: 900, marginBottom: 40 }}>
          🔥 الرياضات الاحترافية بالأكاديمية
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 22 }}>
          {sports.map((sport) => (
            <div
              key={sport.name}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 18,
                padding: 35,
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: 50, marginBottom: 15, filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.4))' }}>
                {sport.icon}
              </div>
              <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 20, margin: 0 }}>{sport.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Players */}
      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '20px 24px 100px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 36, fontWeight: 900, marginBottom: 16 }}>
          ⭐ نجوم وأبطال <span style={{ color: '#d4af37' }}>الأكاديمية</span> الأساطير
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 16, marginBottom: 50 }}>
          نفتخر بصناعة الأبطال ومنصات التتويج المحلية والعالمية
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
          {players.map((player) => (
            <div
              key={player.name}
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: 22,
                padding: 30,
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
                <div
                  style={{
                    width: 85,
                    height: 85,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    border: '3px solid #d4af37',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                  }}
                >
                  <Image src={player.image} alt={player.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 20, margin: '0 0 6px' }}>{player.name}</h3>
                  <span style={{ color: '#0f172a', background: '#d4af37', fontSize: 12.5, fontWeight: 800, padding: '4px 10px', borderRadius: 6, display: 'inline-block' }}>
                    بطل معتمد 🏆
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.75)', borderRadius: 14, padding: 18, border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                <p style={{ color: '#d4af37', fontSize: 14, fontWeight: 800, margin: '0 0 10px' }}>🎖️ إنجازات البطل:</p>
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

      {/* Footer CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px 90px', background: 'rgba(15, 23, 42, 0.85)', borderTop: '1px solid rgba(212, 175, 55, 0.3)' }}>
        <h3 style={{ color: '#f8fafc', fontSize: 28, fontWeight: 900, marginBottom: 16 }}>ابدأ رحلتك نحو البطولات الآن</h3>
        <p style={{ color: '#94a3b8', marginBottom: 30, fontSize: 17 }}>انضم لأكاديمية الدكتور عمرو مسعود واصنع مجدك الرياضي</p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: '16px 50px',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
            color: '#0f172a',
            borderRadius: 14,
            textDecoration: 'none',
            fontWeight: 900,
            fontSize: 18,
            boxShadow: '0 8px 30px rgba(212, 175, 55, 0.5)',
          }}
        >
          سجّل الآن في الأكاديمية
        </Link>
      </section>
    </div>
  )
}