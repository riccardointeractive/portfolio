import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client with service role key.
 * Used in admin API routes. Bypasses RLS.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Server-side Supabase client with anon key.
 * Used for public data fetching. Respects RLS.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
