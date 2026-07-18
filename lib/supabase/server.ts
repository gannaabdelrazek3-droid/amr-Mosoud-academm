import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

 return createServerClient(
    "https://yxobqgrhpnltbtjnqzwz.supabase.co",
    "sb_publishable_41gsQ8FyUs53Ll7QT4Wl7Q_UPfCf_",
    {
      cookies: {
        getAll() {
          console.log("URL IS:", process.env.NEXT_PUBLIC_SUPABASE_URL);
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}