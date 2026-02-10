import { createClient } from '@supabase/supabase-js'

/**
 * Browser-side Supabase client with anon key.
 * Respects RLS — only reads published content.
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
