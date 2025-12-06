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
let dompurifyInitialized = false;

// Lazy initialization function to prevent webpack from bundling server-only dependencies
async function initializeDOMPurify() {
  if (dompurifyInitialized) {
    return;
  }

  if (!isServer) {
    try {
      // Client-side: use regular DOMPurify
      DOMPurify = (await import('dompurify')).default;
      dompurifyInitialized = true;
    } catch (e) {
      // DOMPurify not installed, will use fallback
    }
  } else {
    try {
      // Server-side: use isomorphic-dompurify (it handles jsdom internally)
      // Use dynamic import to prevent webpack from bundling jsdom/canvas for client
      const createDOMPurify = (await import('isomorphic-dompurify')).default;
      // isomorphic-dompurify handles the jsdom setup internally, so we don't need to import it directly
      DOMPurify = createDOMPurify;
      dompurifyInitialized = true;
    } catch (e) {
      // isomorphic-dompurify not installed, will use fallback
    }
  }
}

/**
 * Sanitize HTML using DOMPurify if available, otherwise use basic sanitization
 * Synchronous version for client-side use
 */
export function sanitizeHTML(html: string): string {
  // For client-side, DOMPurify should already be initialized
  if (!isServer && DOMPurify) {
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

  // For server-side or when DOMPurify is not available, use fallback
  return sanitizeHTMLFallback(html);
}

/**
 * Async version for server-side sanitization
 * Use this in server components or API routes
 */
export async function sanitizeHTMLAsync(html: string): Promise<string> {
  await initializeDOMPurify();
  
  if (DOMPurify) {
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
