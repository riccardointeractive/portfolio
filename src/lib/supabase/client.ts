import { createClient } from '@supabase/supabase-js'
import { ENV_PUBLIC } from '@/config/env'

/**
 * Browser-side Supabase client with anon key.
 * Respects RLS — only reads published content.
 */
export function createBrowserClient() {
  return createClient(
    ENV_PUBLIC.supabaseUrl,
    ENV_PUBLIC.supabaseAnonKey
  )
}
