'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'
import AdminShell from '../AdminShell'

interface Sport {
  id: string
  name: string
}

export default function SportsIndexPage() {
  const [sports, setSports] = useState<Sport[]>([])

  useEffect(() => {
    fetch('/api/admin/sports')
      .then((res) => res.json())
      .then((data) => setSports(data.sports || []))
  }, [])

  return (
    <AdminShell fullName="">
      <div style={s.page}>
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>الرياضات</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>اختر رياضة لتسجيل الحضور والتقييم</p>
          </div>
        </div>

        <div style={s.actionGrid}>
          {sports.map((sport) => (
            <Link key={sport.id} href={`/admin/sports/${sport.id}`} className="action-card" style={s.actionCard}>
              <span style={{ fontSize: 26 }}>🏅</span>
              {sport.name}
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}