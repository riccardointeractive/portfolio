/**
 * Redis — Key patterns and namespace configuration
 *
 * All Redis keys are namespaced with `portfolio:` to avoid
 * conflicts with other projects sharing the same Upstash instance.
 */

const PREFIX = 'portfolio:'

export const REDIS_KEYS = {
  prefix: PREFIX,
  session: (token: string) => `${PREFIX}session:${token}`,
  rateLimit: (key: string) => `${PREFIX}ratelimit:${key}`,
} as const
