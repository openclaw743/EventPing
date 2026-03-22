/**
 * Generates a URL-safe slug from a title.
 * - Lowercases the input
 * - Strips possessive apostrophes and similar "word-glue" chars
 * - Replaces remaining non-alphanumeric characters with hyphens
 * - Collapses multiple consecutive hyphens into one
 * - Trims leading/trailing hyphens
 * - Appends a 4-character random alphanumeric suffix
 *
 * @example generateSlug("Alice's Birthday!") => "alices-birthday-a3f1"
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    // Strip possessive apostrophes and curly quotes so they don't produce a hyphen
    .replace(/['\u2018\u2019\u201A\u201B]/g, '')
    // Replace remaining non-alphanumeric sequences with a single hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // Collapse consecutive hyphens
    .replace(/-{2,}/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '') || 'event';

  const suffix = Math.random().toString(36).slice(2, 6).padEnd(4, '0');
  return `${base}-${suffix}`;
}
