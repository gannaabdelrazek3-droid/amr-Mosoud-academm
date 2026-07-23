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
        background: 'radial-gradient(circle at 20% 10%, #1e293b 0%, #0f172a 55%, #020617 100%)',
        minHeight: '100vh',
        fontFamily: "'Tajawal', sans-serif",
        color: '#e2e8f0',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>🥇</span>
          <strong style={{ color: '#f8fafc', fontSize: 18 }}>أكاديمية الكابتن عمرو مسعود</strong>
        </div>
        <Link
          href="/login"
          className="btn-primary"
          style={{
            padding: '10px 24px',
            background: '#d4af37',
            color: '#0f172a',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          تسجيل الدخول
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '70px 24px 50px', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ color: '#d4af37', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
          دكتور في كلية علوم الرياضة
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#f8fafc', margin: '0 0 16px', lineHeight: 1.3 }}>
          الكابتن عمرو مسعود
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 640, margin: '0 auto 32px' }}>
          لاعب منتخب مصر للساندا (2012–2016) وبطل جمهورية متعدد الألقاب في الساندا وكيك بوكسينج ومواي تاي،
          على مدار أكثر من عشرين عامًا من الإنجاز والتدريب الاحترافي
        </p>

        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            margin: '0 auto 20px',
            border: '4px solid #d4af37',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.35)',
          }}
        >
          <Image src="/images/amr-masoud.jpeg" alt="الكابتن عمرو مسعود" fill style={{ objectFit: 'cover' }} />
        </div>
      </section>

      {/* Captain achievements */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 60px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 26, fontWeight: 900, marginBottom: 28 }}>
          إنجازات الكابتن
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {captainAchievements.map((a, i) => (
            <div
              key={i}
              className="card-hover"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 14,
                padding: 20,
              }}
            >
              <p style={{ color: '#d4af37', fontWeight: 900, fontSize: 22, margin: 0 }}>{a.year}</p>
              <p style={{ color: '#f1f5f9', fontWeight: 700, margin: '6px 0 0' }}>{a.title}</p>
              {a.place && <p style={{ color: '#94a3b8', fontSize: 14, margin: '4px 0 0' }}>{a.place}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Sports */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 60px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 26, fontWeight: 900, marginBottom: 28 }}>
          الرياضات المتاحة بالأكاديمية
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {sports.map((sport) => (
            <div
              key={sport.name}
              className="card-hover"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 14,
                padding: 26,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 10 }}>{sport.icon}</div>
              <p style={{ color: '#f1f5f9', fontWeight: 700, margin: 0 }}>{sport.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Players */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 80px' }}>
        <h2 style={{ textAlign: 'center', color: '#f8fafc', fontSize: 26, fontWeight: 900, marginBottom: 28 }}>
          أبطال الأكاديمية
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {players.map((player) => (
            <div
              key={player.name}
              className="card-hover"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0,
                  border: '2px solid #d4af37',
                }}
              >
                <Image src={player.image} alt={player.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div>
                <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>{player.name}</p>
                <ul style={{ margin: 0, paddingRight: 18, color: '#94a3b8', fontSize: 13.5, lineHeight: 1.8 }}>
                  {player.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ textAlign: 'center', padding: '40px 24px 70px' }}>
        <h3 style={{ color: '#f8fafc', fontSize: 22, marginBottom: 16 }}>انضم لأكاديمية الأبطال</h3>
        <Link
          href="/login"
          className="btn-primary"
          style={{
            display: 'inline-block',
            padding: '14px 40px',
            background: '#d4af37',
            color: '#0f172a',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          سجّل الآن
        </Link>
      </section>
    </div>
  )
}