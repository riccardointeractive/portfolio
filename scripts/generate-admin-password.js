#!/usr/bin/env node

/**
 * Generate ADMIN_PASSWORD_HASH for .env.local
 *
 * Usage:
 *   node scripts/generate-admin-password.js <your-password>
 *   node scripts/generate-admin-password.js <your-password> <custom-salt>
 *
 * Then add to .env.local:
 *   ADMIN_PASSWORD_HASH=<output hash>
 *   ADMIN_PASSWORD_SALT=<output salt>
 */

const crypto = require('crypto')

const password = process.argv[2]
const salt = process.argv[3] || 'portfolio-admin-salt-' + crypto.randomBytes(8).toString('hex')

if (!password) {
  console.error('Usage: node scripts/generate-admin-password.js <password> [salt]')
  process.exit(1)
}

const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')

console.log('')
console.log('Add these to your .env.local:')
console.log('')
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
console.log(`ADMIN_PASSWORD_SALT=${salt}`)
console.log('')
