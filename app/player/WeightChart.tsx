'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(148,163,184,0.15)" />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
        <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #d4af37', borderRadius: 8, color: '#fff' }} />
        <Line type="monotone" dataKey="weight" stroke="#d4af37" strokeWidth={3} dot={{ r: 4, fill: '#d4af37' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}