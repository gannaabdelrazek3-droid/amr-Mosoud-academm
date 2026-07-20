'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminStyles as s } from '../adminStyles'

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
    <div style={s.page}>
      <h1 style={s.title}>الرياضات</h1>
      <p style={s.subtitle}>اختار رياضة لتسجيل الحضور والتقييم</p>

      {sports.map((sport) => (
        <Link key={sport.id} href={`/admin/sports/${sport.id}`} style={{ textDecoration: 'none' }}>
          <div style={s.checkboxLabel}>
            <span style={{ fontSize: 16, color: '#111' }}>{sport.name}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}