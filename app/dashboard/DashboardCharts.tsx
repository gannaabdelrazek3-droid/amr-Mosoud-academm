'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { adminStyles as s } from '../admin/adminStyles'

interface RevenuePoint {
  month: string
  amount: number
}

interface StatusPoint {
  name: string
  value: number
  color: string
}

export default function DashboardCharts({
  revenueData,
  statusData,
}: {
  revenueData: RevenuePoint[]
  statusData: StatusPoint[]
}) {
  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
      <div style={{ ...s.chartCard, flex: 2, minWidth: 320 }}>
        <h3 style={{ color: '#f8fafc', margin: '0 0 16px' }}>نظرة عامة على الإيرادات</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={revenueData}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #d4af37', borderRadius: 8, color: '#fff' }} />
            <Line type="monotone" dataKey="amount" stroke="#d4af37" strokeWidth={3} dot={{ r: 4, fill: '#d4af37' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ ...s.chartCard, flex: 1, minWidth: 260 }}>
        <h3 style={{ color: '#f8fafc', margin: '0 0 16px' }}>حالة الاشتراكات</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
              {statusData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #d4af37', borderRadius: 8, color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#e2e8f0', fontFamily: "'Tajawal', sans-serif" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}