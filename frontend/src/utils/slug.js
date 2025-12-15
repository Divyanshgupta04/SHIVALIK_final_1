// utils/slug.js
// Small helpers shared by storefront + admin-catalog integration.

export function slugifyName(name = '') {
  return String(name)
    .toLowerCase()
    .trim()
    // Keep letters/numbers/spaces/hyphens, drop other chars.
    .replace(/[^a-z0-9\s-]/g, '')
    // Convert whitespace to single hyphen.
    .replace(/\s+/g, '-')
    // Collapse multiple hyphens.
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens.
    .replace(/^-+|-+$/g, '');
}

export function normalizeForCompare(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    // Treat hyphen/underscore like spaces so "aadhaar-services" matches "aadhaar services".
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');
}
