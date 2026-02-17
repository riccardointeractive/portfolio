/**
 * Env — Typed environment variable access
 *
 * Single source of truth for all environment variables.
 * Never use `process.env.X` directly — import from here.
 *
 * Server-only variables are accessed lazily (getter functions)
 * to avoid errors in client bundles.
 */

/** Public env vars (available in browser via NEXT_PUBLIC_ prefix) */
export const ENV_PUBLIC = {
  get supabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL!
  },
  get supabaseAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  },
  get r2PublicUrl() {
    return process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL!
  },
} as const

/** Server-only env vars (never exposed to client) */
export const ENV_SERVER = {
  get adminPasswordHash() {
    return process.env.ADMIN_PASSWORD_HASH
  },
  get adminPasswordSalt() {
    return process.env.ADMIN_PASSWORD_SALT || 'portfolio-default-salt-change-me'
  },
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY!
  },
  get supabaseDbUrl() {
    return process.env.SUPABASE_DB_URL
  },
  get redisUrl() {
    return process.env.UPSTASH_REDIS_REST_URL!
  },
  get redisToken() {
    return process.env.UPSTASH_REDIS_REST_TOKEN!
  },
  get r2AccountId() {
    return process.env.R2_ACCOUNT_ID!
  },
  get r2AccessKeyId() {
    return process.env.R2_ACCESS_KEY_ID!
  },
  get r2SecretAccessKey() {
    return process.env.R2_SECRET_ACCESS_KEY!
  },
  get r2BucketName() {
    return process.env.R2_BUCKET_NAME!
  },
  get r2PublicUrl() {
    return process.env.R2_PUBLIC_URL!
  },
  get cloudflareApiToken() {
    return process.env.CLOUDFLARE_API_TOKEN
  },
  get tmdbApiKey() {
    return process.env.TMDB_API_KEY
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production'
  },
} as const
