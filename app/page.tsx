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
        background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 50%, #020617 100%)',
        minHeight: '100vh',
        fontFamily: "'Tajawal', sans-serif",
        color: '#e2e8f0',
        overflowX: 'hidden',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))' }}>🥇</span>
          <strong style={{ color: '#f8fafc', fontSize: 20, letterSpacing: 0.5 }}>أكاديمية الكابتن عمرو مسعود</strong>
        </div>
        <Link
          href="/login"
          style={{
            padding: '10px 26px',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
            color: '#0f172a',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 800,
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
            transition: 'transform 0.2s ease',
          }}
        >
          تسجيل الدخول
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 950, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '6px 18px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 30,
            marginBottom: 16,
          }}
        >
          <span style={{ color: '#d4af37', fontWeight: 700, letterSpacing: 1.5, fontSize: 14 }}>
            🌟 دكتور في كلية علوم الرياضة
          </span>
        </div>

        <h1 style={{ fontSize: 48, fontWeight: 900, color: '#f8fafc', margin: '0 0 20px', lineHeight: 1.2 }}>
          الكابتن <span style={{ color: '#d4af37', textShadow: '0 0 25px rgba(212, 175, 55, 0.4)' }}>عمرو مسعود</span>
        </h1>
        
        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 700, margin: '0 auto 35px', lineHeight: 1.7 }}>
          لاعب منتخب مصر للساندا (2012–2016) وبطل جمهورية متعدد الألقاب في الساندا وكيك بوكسينج ومواي تاي،
          على مدار أكثر من عشرين عامًا من الإنجاز والتدريب الاحترافي
        </p>

        {/* Hero Image with Glowing Aura */}
        <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 20px' }}>
          <div
            style={{
              position: 'absolute',
              inset: -6,
              background: 'linear-gradient(135deg, #d4af37, transparent, #d4af37)',
              borderRadius: '50%',
              zIndex: 0,
              filter: 'blur(10px)',
              opacity: 0.7,
            }}
          />
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              position: 'relative',
              zIndex: 1,
              border: '4px solid #d4af37',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <Image src="/images/amr-masoud.jpeg" alt="الكابتن عمرو مسعود" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* Captain Achievements */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 70px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 30, fontWeight: 900, marginBottom: 35 }}>
          🏆 إنجازات <span style={{ color: '#d4af37' }}>التاريخية</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {captainAchievements.map((a, i) => (
            <div
              key={i}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 16,
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 4,
                  height: '100%',
                  background: '#d4af37',
                }}
              />
              <span style={{ color: '#d4af37', fontWeight: 900, fontSize: 24, display: 'block', marginBottom: 4 }}>
                {a.year}
              </span>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, margin: '0 0 6px' }}>{a.title}</p>
              {a.place && (
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: '#e2e8f0',
                    padding: '2px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
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
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 70px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 30, fontWeight: 900, marginBottom: 35 }}>
          🔥 الرياضات المتاحة بالأكاديمية
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {sports.map((sport) => (
            <div
              key={sport.name}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 16,
                padding: 30,
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ fontSize: 45, marginBottom: 12, filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))' }}>
                {sport.icon}
              </div>
              <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 18, margin: 0 }}>{sport.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Players - Heroes Spotlight */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 90px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 32, fontWeight: 900, marginBottom: 40 }}>
          ⭐ أبطال <span style={{ color: '#d4af37' }}>الأكاديمية</span> المذهلون
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {players.map((player) => (
            <div
              key={player.name}
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: 20,
                padding: 26,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                <div
                  style={{
                    width: 75,
                    height: 75,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    border: '3px solid #d4af37',
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <Image src={player.image} alt={player.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18, margin: '0 0 6px' }}>{player.name}</h3>
                  <span style={{ color: '#d4af37', fontSize: 12, fontWeight: 700, background: 'rgba(212,175,55,0.1)', padding: '3px 8px', borderRadius: 4 }}>
                    بطل معتمد
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: '#d4af37', fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>✨ أبرز الإنجازات:</p>
                <ul style={{ margin: 0, paddingRight: 16, color: '#e2e8f0', fontSize: 14, lineHeight: 1.8 }}>
                  {player.achievements.map((ach, i) => (
                    <li key={i} style={{ marginBottom: 4, fontWeight: 500 }}>{ach}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ textAlign: 'center', padding: '50px 24px 80px', background: 'rgba(15, 23, 42, 0.7)', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <h3 style={{ color: '#f8fafc', fontSize: 26, fontWeight: 900, marginBottom: 16 }}>انضم لأكاديمية الأبطال وصنع مستقبلك</h3>
        <p style={{ color: '#94a3b8', marginBottom: 25, fontSize: 16 }}>سجل الآن وكن جزءاً من قائمة أبطال المستقبل</p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: '16px 45px',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
            color: '#0f172a',
            borderRadius: 14,
            textDecoration: 'none',
            fontWeight: 900,
            fontSize: 18,
            boxShadow: '0 6px 25px rgba(212, 175, 55, 0.4)',
            transition: 'transform 0.2s ease',
          }}
        >
          سجّل الآن
        </Link>
      </section>
    </div>
  )
}