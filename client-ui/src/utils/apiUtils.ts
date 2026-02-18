/**
 * Utility function to get the correct API base URL based on environment
 *
 * @param path - API path without leading slash (e.g., "api/auth/send-code")
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  // Get the base URL from environment variable or use relative path for local development
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;

  // If we have an API base URL, use it, otherwise use relative path
  if (apiBase) {
    // Ensure path doesn't start with a slash when concatenating
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${apiBase}/${cleanPath}`;
  } else {
    // For local development or when API is on the same domain
    return path.startsWith('/') ? path : `/${path}`;
  }
}