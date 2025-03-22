/**
 * Configuration for API endpoints
 */

/**
 * Get the base URL for the Rummage API
 * Uses the NEXT_PUBLIC_RUMMAGE_API_URL environment variable if available,
 * otherwise falls back to the default URL
 */
export function getRummageApiUrl(): string {
  return process.env.NEXT_PUBLIC_RUMMAGE_API_URL || 'https://rummage.thebitop.net';
}

/**
 * Get the full URL for a specific Rummage API endpoint
 * @param endpoint - The API endpoint path (e.g., '/v1/scrape')
 * @returns The full URL for the endpoint
 */
export function getRummageApiEndpoint(endpoint: string): string {
  const baseUrl = getRummageApiUrl();
  // Ensure endpoint starts with a slash if not already
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}
