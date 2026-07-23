'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'

interface SkillPoint {
  name: string
  value: number
}

export default function SkillsRadarChart({ data }: { data: SkillPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="المستوى" dataKey="value" stroke="#111" fill="#111" fillOpacity={0.4} />
      </RadarChart>
    </ResponsiveContainer>
  )
}