'use client'

import { useState } from 'react'
import QuickAddPlayerModal from '@/app/admin/components/QuickAddPlayerModal'
export default function QuickAddPlayerClientWrapper() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
          color: '#0f172a',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '10px',
          fontWeight: '900',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(212,175,55,0.2)',
          fontSize: '14px',
        }}
      >
        ⚡ إضافة لاعب سريع
      </button>

      <QuickAddPlayerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          window.location.reload() // لإعادة تحميل الداشبورد وتحديث أرقام اللاعبين والإيرادات تلقائياً
        }}
      />
    </>
  )
}