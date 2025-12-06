/**
 * HTML Sanitization Utility
 * 
 * Provides safe HTML rendering by sanitizing potentially dangerous content.
 * For client-side use, we'll use a simple tag whitelist approach.
 * For production, consider using DOMPurify for more robust sanitization.
 */

/**
 * Simple HTML sanitizer using a whitelist approach
 * This is a basic implementation - for production, consider using DOMPurify
 * 
 * NOTE: This function requires browser DOM APIs, so it only works client-side.
 * For server-side rendering, use sanitizeHTMLServer instead.
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Server-side: fall back to server sanitization
    return sanitizeHTMLServer(html);
  }

  // Client-side: Create a temporary DOM element to parse and sanitize
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Whitelist of allowed tags and attributes
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'img',
    'div', 'span', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
  ];
  
  const allowedAttributes: Record<string, string[]> = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'code': ['class'],
    'pre': ['class'],
  };

  // Recursively sanitize nodes
  function sanitizeNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // If tag is not allowed, return null (remove it)
      if (!allowedTags.includes(tagName)) {
        return null;
      }

      // Create a new element with the same tag
      const newElement = document.createElement(tagName);

      // Copy allowed attributes
      const allowedAttrs = allowedAttributes[tagName] || [];
      for (const attr of allowedAttrs) {
        const value = element.getAttribute(attr);
        if (value !== null) {
          // Sanitize href to prevent javascript: and data: URLs
          if (attr === 'href') {
            if (value.startsWith('javascript:') || value.startsWith('data:')) {
              continue; // Skip dangerous URLs
            }
            // Ensure external links have proper rel attributes
            if (value.startsWith('http://') || value.startsWith('https://')) {
              newElement.setAttribute('href', value);
              newElement.setAttribute('rel', 'noopener noreferrer');
              newElement.setAttribute('target', '_blank');
            } else {
              newElement.setAttribute('href', value);
            }
          } else {
            newElement.setAttribute(attr, value);
          }
        }
      }

      // Recursively sanitize children
      for (const child of Array.from(element.childNodes)) {
        const sanitizedChild = sanitizeNode(child);
        if (sanitizedChild) {
          newElement.appendChild(sanitizedChild);
        }
      }

      return newElement;
    }

    return null;
  }

  // Sanitize the body content
  const body = doc.body;
  const sanitizedDiv = document.createElement('div');
  
  for (const child of Array.from(body.childNodes)) {
    const sanitized = sanitizeNode(child);
    if (sanitized) {
      sanitizedDiv.appendChild(sanitized);
    }
  }

  return sanitizedDiv.innerHTML;
}

/**
 * Server-side HTML sanitization
 * For server-side rendering, we use a simpler approach since we don't have DOM APIs
 */
export function sanitizeHTMLServer(html: string): string {
  // Basic server-side sanitization: remove script tags and dangerous attributes
  // For production, consider using a library like sanitize-html or DOMPurify (isomorphic version)
  
  let sanitized = html;
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: and data: URLs from href and src
  sanitized = sanitized.replace(/(href|src)\s*=\s*["'](javascript|data):[^"']*["']/gi, '');
  
  return sanitized;
}

/**
 * Main sanitization function that works in both client and server contexts
 * 
 * NOTE: For better security, consider using DOMPurify via dompurify-wrapper.ts
 */
export function sanitize(html: string): string {
  // For client-side, use browser-based sanitization only
  // Don't try to use DOMPurify wrapper on client to avoid webpack analyzing server imports
  if (typeof window !== 'undefined') {
    return sanitizeHTML(html);
  }
  
  // Server-side: use basic sanitization (DOMPurify requires async initialization)
  // For server-side with DOMPurify, use sanitizeHTMLAsync from dompurify-wrapper
  return sanitizeHTMLServer(html);
}
