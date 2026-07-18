import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  // القيم ثابتة هنا
  const supabaseUrl = "https://yxobqgrhpnltbtjnqzwz.supabase.co";
  const supabaseAnonKey = "sb_publishable_41gsQ8FyUs53LI7QT4Wi7Q_UPfCfhmg_";

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // هذا الجزء ضروري لتجنب الأخطاء في دوال السيرفر
            }
          })
        },
      },
    }
  )
}