/**
 * Image Optimization Configuration
 *
 * Centralized `sizes` strings for next/image.
 * Determines which image widths the browser requests at each breakpoint.
 * Follows the same centralized-config pattern as site.ts and design-tokens.ts.
 */

export const imageSizes = {
  /** ProjectCard — 1 col mobile, 2 col tablet, 3 col desktop */
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',

  /** Hero cover image — full width up to max container */
  hero: '(max-width: 768px) 100vw, (max-width: 1200px) 960px, 1200px',

  /** Content blocks (MediaBlock, ShotBlock, CompareBlock) */
  content: '(max-width: 768px) 100vw, 768px',

  /** Admin grid thumbnails */
  adminThumbnail: '128px',

  /** Admin detail preview */
  adminPreview: '480px',
} as const

export type ImageSizeContext = keyof typeof imageSizes
