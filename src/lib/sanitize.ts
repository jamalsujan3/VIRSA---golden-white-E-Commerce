/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Security & Sanitization Utilities for VIRSA Luxury Menswear Storefront
 * Enforces XSS defense, character escaping, and strict input validation on both client & server.
 */

/**
 * Escapes potentially hazardous HTML characters to prevent XSS.
 */
export function escapeHTML(str: unknown): string {
  if (typeof str !== 'string') {
    if (str === null || str === undefined) return '';
    return String(str);
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return str.replace(/[&<>"'`=/]/g, (char) => map[char] || char);
}

/**
 * Strips script tags, javascript: pseudo-protocols, HTML tags, and event handlers from text.
 */
export function sanitizeUGC(input: unknown): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input);
  }

  // 1. Normalize unicode and remove control characters
  let clean = input
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  // 2. Strip HTML tags
  clean = clean.replace(/<[^>]*>?/gm, '');

  // 3. Strip javascript: / vbscript: / data: protocols
  clean = clean.replace(/(javascript|vbscript|data):/gi, '');

  // 4. Strip inline event handlers pattern like onerror=, onclick=
  clean = clean.replace(/on\w+\s*=/gi, '');

  // 5. Trim leading/trailing whitespace
  return clean.trim();
}

/**
 * Validates standard RFC 5322-compliant email formats.
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates Bangladesh phone numbers (+8801XXXXXXXXX or 01XXXXXXXXX).
 */
export function validateBDPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  const clean = phone.replace(/[\s\-()]/g, '');
  // Matches +8801XXXXXXXXX or 01XXXXXXXXX (11 digits starting with 013-019)
  const phoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
  return phoneRegex.test(clean);
}

/**
 * Validates safe string lengths within bounds.
 */
export function validateLength(str: unknown, min: number, max: number): boolean {
  if (typeof str !== 'string') return false;
  const len = str.trim().length;
  return len >= min && len <= max;
}

/**
 * Validates positive integers for cart quantities or pricing units.
 */
export function validatePositiveInt(val: unknown, min = 1, max = 99): boolean {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val >= min && val <= max;
  }
  if (typeof val === 'string') {
    const num = Number(val);
    return Number.isInteger(num) && num >= min && num <= max;
  }
  return false;
}

/**
 * Safely sanitizes a customer review before committing or displaying.
 */
export interface CleanReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export function sanitizeReviewInput(raw: {
  author?: unknown;
  rating?: unknown;
  comment?: unknown;
  verified?: unknown;
}): { isValid: boolean; review?: CleanReview; error?: string } {
  const author = sanitizeUGC(raw.author);
  const comment = sanitizeUGC(raw.comment);
  const ratingNum = Number(raw.rating);

  if (!validateLength(author, 2, 80)) {
    return { isValid: false, error: 'Author name must be between 2 and 80 characters.' };
  }

  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return { isValid: false, error: 'Rating must be a whole number between 1 and 5 stars.' };
  }

  if (!validateLength(comment, 5, 1000)) {
    return { isValid: false, error: 'Review comment must be between 5 and 1,000 characters.' };
  }

  const cleanReview: CleanReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    author,
    rating: Math.round(ratingNum),
    date: new Date().toISOString().split('T')[0],
    comment,
    verified: Boolean(raw.verified)
  };

  return { isValid: true, review: cleanReview };
}
