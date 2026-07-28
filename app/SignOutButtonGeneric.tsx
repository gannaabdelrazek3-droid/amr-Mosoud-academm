'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButtonGeneric() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: '10px 20px',
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#fca5a5',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 10,
        fontWeight: 700,
        fontFamily: "'Tajawal', sans-serif",
        cursor: 'pointer',
        fontSize: 14,
      }}
    >
      🚪 تسجيل الخروج
    </button>
  )
}