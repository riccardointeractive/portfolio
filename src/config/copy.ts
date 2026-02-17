/**
 * Copy — All user-facing strings
 *
 * Single source of truth for every text string shown to users.
 * Keeps components clean and makes future i18n trivial.
 */

export const COPY = {
  sections: {
    hero: {
      ctaPrimary: 'View Projects',
      ctaSecondary: 'Get in Touch',
    },
    projects: {
      title: 'Selected Projects',
      description:
        "A few things I've designed and built — from DeFi platforms to tokenization systems.",
    },
    about: {
      title: 'About',
      body: 'I work across the full stack — from designing interfaces in Figma to writing smart contracts in Rust. I like building things that feel right: clear, fast, and purposeful.',
      skillsLabel: 'Technologies',
    },
    contact: {
      title: 'Get in Touch',
      description:
        'Interested in working together or just want to say hello? Drop me a line.',
    },
  },

  auth: {
    passwordRequired: 'Password is required',
    invalidCredentials: 'Invalid credentials',
    serverConfigError: 'Server configuration error',
    serverError: 'Server error',
    unauthorized: 'Unauthorized',
    sessionExpired: 'Session expired',
    sessionInvalidated: 'Session invalidated',
    sessionAlreadyExpired: 'Session already expired',
    sessionNotFound: 'Session not found or expired',
    tokenRequired: 'Token is required',
    authSuccess: 'Authentication successful',
    invalidServerResponse: 'Invalid server response',
    networkError: 'Network error. Please try again.',
    tooManyAttempts: (retrySeconds: number) =>
      `Too many attempts. Try again in ${retrySeconds} seconds.`,
    lockedOut: (minutes: number) =>
      `Too many failed attempts. Wait ${minutes} minutes.`,
    lockedOutFixed: 'Too many failed attempts. Locked for 15 minutes.',
    incorrectPassword: (remaining: number) =>
      `Incorrect password. ${remaining} attempts remaining.`,
  },

  validation: {
    titleAndSlugRequired: 'title and slug are required',
    titleSlugTypeRequired: 'title, slug, and type are required',
    slugExists: 'Slug already exists',
    filenameAndContentTypeRequired: 'filename and contentType are required',
    missingMediaFields:
      'Missing required fields: filename, original_name, mime_type, size_bytes, url',
    idRequired: 'id is required',
    queryRequired: 'Query parameter required',
  },

  notFound: {
    project: 'Project not found',
    shot: 'Shot not found',
    media: 'Media not found',
    database: 'Database not found',
    record: 'Record not found',
    view: 'View not found',
  },

  envErrors: {
    supabaseDbUrl:
      'SUPABASE_DB_URL not configured. Add it to .env.local (Supabase Dashboard → Settings → Database → Connection string URI)',
    cloudflareApiToken: 'CLOUDFLARE_API_TOKEN not configured',
    r2Config: 'R2_ACCOUNT_ID or R2_BUCKET_NAME not configured',
    tmdbApiKey: 'TMDB_API_KEY not configured',
    adminPasswordHash: 'ADMIN_PASSWORD_HASH environment variable not set!',
  },

  footer: {
    copyright: (year: number, name: string) => `© ${year} ${name}`,
  },

  social: {
    twitter: 'X / Twitter',
  },
} as const
