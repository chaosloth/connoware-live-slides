/**
 * Security utilities for validating and sanitizing user input
 */

/**
 * Validates if a URL is safe to open
 * Only allows http: and https: protocols to prevent javascript:, data:, etc.
 *
 * @param url - The URL to validate
 * @returns true if URL is safe, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Safely opens a URL after validation
 *
 * @param url - The URL to open
 * @param target - The target window/frame (default: '_self')
 * @returns true if URL was opened, false if blocked
 */
export function safeOpenUrl(url: string, target: string = '_self'): boolean {
  if (!isValidUrl(url)) {
    console.error('Blocked attempt to open invalid URL:', url);
    return false;
  }

  window.open(url, target);
  return true;
}
