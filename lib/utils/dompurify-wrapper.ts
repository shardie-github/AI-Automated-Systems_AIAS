/**
 * DOMPurify Wrapper
 * 
 * Provides HTML sanitization using DOMPurify when available.
 * Falls back to basic sanitization if DOMPurify is not installed.
 * 
 * To install DOMPurify:
 * npm install dompurify isomorphic-dompurify
 * 
 * For server-side rendering, use isomorphic-dompurify:
 * npm install isomorphic-dompurify
 */

let DOMPurify: any = null;
let isServer = typeof window === 'undefined';

// Try to load DOMPurify
if (!isServer) {
  try {
    // Client-side: use regular DOMPurify
    DOMPurify = require('dompurify');
  } catch (e) {
    // DOMPurify not installed, will use fallback
  }
} else {
  try {
    // Server-side: use isomorphic-dompurify
    const createDOMPurify = require('isomorphic-dompurify');
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    DOMPurify = createDOMPurify(window);
  } catch (e) {
    // isomorphic-dompurify not installed, will use fallback
  }
}

/**
 * Sanitize HTML using DOMPurify if available, otherwise use basic sanitization
 */
export function sanitizeHTML(html: string): string {
  if (DOMPurify) {
    // Use DOMPurify for robust sanitization
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'img',
        'div', 'span', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'hr',
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class',
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }

  // Fallback to basic sanitization (from sanitize-html.ts)
  return sanitizeHTMLFallback(html);
}

/**
 * Basic HTML sanitization fallback
 */
function sanitizeHTMLFallback(html: string): string {
  let sanitized = html;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: and data: URLs from href and src
  sanitized = sanitized.replace(/(href|src)\s*=\s*["'](javascript|data):[^"']*["']/gi, '');

  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  return sanitized;
}

/**
 * Check if DOMPurify is available
 */
export function isDOMPurifyAvailable(): boolean {
  return DOMPurify !== null;
}
