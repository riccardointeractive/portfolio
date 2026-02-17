import { createClient } from '@supabase/supabase-js'
import { ENV_PUBLIC, ENV_SERVER } from '@/config/env'

/**
 * Server-side Supabase client with service role key.
 * Used in admin API routes. Bypasses RLS.
 */
export function createAdminClient() {
  return createClient(
    ENV_PUBLIC.supabaseUrl,
    ENV_SERVER.supabaseServiceRoleKey
  )
}

/**
 * Server-side Supabase client with anon key.
 * Used for public data fetching. Respects RLS.
 */
export function createPublicClient() {
  return createClient(
    ENV_PUBLIC.supabaseUrl,
    ENV_PUBLIC.supabaseAnonKey
  )
}
