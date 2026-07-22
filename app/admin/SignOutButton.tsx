'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 10,
        color: '#fca5a5',
        background: 'transparent',
        border: 'none',
        fontSize: 15,
        fontWeight: 600,
        fontFamily: "'Tajawal', system-ui, sans-serif",
        cursor: 'pointer',
        textAlign: 'right',
      }}
    >
      🚪 تسجيل خروج
    </button>
  )
}