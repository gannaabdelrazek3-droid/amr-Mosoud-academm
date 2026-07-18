import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // القيم ثابتة هنا لتجنب مشاكل الـ Environment Variables
  const supabaseUrl = "https://yxobqgrhpnltbtjnqzwz.supabase.co";
  const supabaseAnonKey = "sb_publishable_41gsQ8FyUs53LI7QT4Wi7Q_UPfCfhmg_";

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}