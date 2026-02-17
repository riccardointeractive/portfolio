import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import postgres from 'postgres'
import { ENV_SERVER } from '@/config/env'

/**
 * Cortex Schema Setup
 *
 * POST /api/admin/cortex/setup
 *
 * Creates the 4 Cortex tables in Supabase if they don't exist.
 * Uses direct Postgres connection via SUPABASE_DB_URL.
 * Safe to run multiple times (CREATE TABLE IF NOT EXISTS).
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const dbUrl = ENV_SERVER.supabaseDbUrl
  if (!dbUrl) {
    return NextResponse.json(
      {
        success: false,
        error: 'SUPABASE_DB_URL not configured. Add it to .env.local (Supabase Dashboard → Settings → Database → Connection string URI)',
      },
      { status: 500 }
    )
  }

  const sql = postgres(dbUrl, { ssl: 'require' })

  try {
    // Create all 4 tables
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS cortex_databases (
        id text PRIMARY KEY,
        name text NOT NULL,
        description text NOT NULL DEFAULT '',
        icon text NOT NULL DEFAULT 'folder',
        color text NOT NULL DEFAULT '#3b82f6',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS cortex_fields (
        id text PRIMARY KEY,
        database_id text NOT NULL REFERENCES cortex_databases(id) ON DELETE CASCADE,
        name text NOT NULL,
        type text NOT NULL,
        options jsonb,
        relation_config jsonb,
        required boolean NOT NULL DEFAULT false,
        sort_order integer NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS cortex_records (
        id text PRIMARY KEY,
        database_id text NOT NULL REFERENCES cortex_databases(id) ON DELETE CASCADE,
        "values" jsonb NOT NULL DEFAULT '{}',
        sort_order integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS cortex_views (
        id text PRIMARY KEY,
        database_id text NOT NULL REFERENCES cortex_databases(id) ON DELETE CASCADE,
        name text NOT NULL,
        type text NOT NULL,
        filters jsonb NOT NULL DEFAULT '[]',
        sorts jsonb NOT NULL DEFAULT '[]',
        visible_fields jsonb NOT NULL DEFAULT '[]',
        config jsonb,
        sort_order integer NOT NULL DEFAULT 0
      );
    `)

    // Disable RLS on all tables (we use service role key)
    await sql.unsafe(`
      ALTER TABLE cortex_databases DISABLE ROW LEVEL SECURITY;
      ALTER TABLE cortex_fields DISABLE ROW LEVEL SECURITY;
      ALTER TABLE cortex_records DISABLE ROW LEVEL SECURITY;
      ALTER TABLE cortex_views DISABLE ROW LEVEL SECURITY;
    `)

    // Verify tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'cortex_%'
      ORDER BY table_name
    `

    await sql.end()

    return NextResponse.json({
      success: true,
      tables: tables.map((t) => t.table_name),
      message: `${tables.length} Cortex tables ready.`,
    })
  } catch (error) {
    await sql.end()
    console.error('Schema setup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Schema setup failed',
      },
      { status: 500 }
    )
  }
}
