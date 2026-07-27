'use client'

interface SkillData {
  name: string
  value: number
}

export default function SkillsRadarChart({ data }: { data: SkillData[] }) {
  function getColor(value: number) {
    if (value >= 75) return '#22c55e'
    if (value >= 50) return '#d4af37'
    if (value >= 25) return '#f59e0b'
    return '#ef4444'
  }

  function getLabel(value: number) {
    if (value >= 75) return 'ممتاز'
    if (value >= 50) return 'جيد'
    if (value >= 25) return 'متوسط'
    return 'يحتاج تطوير'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {data.map((skill) => (
        <div key={skill.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{skill.name}</span>
            <span style={{ color: getColor(skill.value), fontWeight: 900, fontSize: 15 }}>
              {skill.value}% — {getLabel(skill.value)}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 14,
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            }}
          >
            <div
              style={{
                width: `${Math.min(skill.value, 100)}%`,
                height: '100%',
                background: getColor(skill.value),
                borderRadius: 10,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}