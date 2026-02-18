/**
 * Utility function to get the correct API base URL based on environment
 *
 * @param path - API path without leading slash (e.g., "api/auth/send-code")
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  // Get the base URL from environment variable
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;

  // Check for Vercel production environment
  const isVercelProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
                            (typeof window !== 'undefined' && window?.location?.hostname === 'preso.twilio.world');

  // Special handling for auth endpoints when on Vercel
  if (isVercelProduction && path.startsWith('api/auth/')) {
    // Hardcode the production URL for auth endpoints
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `https://connoware-live-slides-6212-dev.twil.io/${cleanPath}`;
  }

  // Normal case: If we have an API base URL, use it
  if (apiBase) {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${apiBase}/${cleanPath}`;
  } else {
    // Fallback to relative paths for local development
    return path.startsWith('/') ? path : `/${path}`;
  }
}