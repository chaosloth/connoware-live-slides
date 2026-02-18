import { ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Context } from '../types/context';

/**
 * Helper function to handle CORS in Twilio Functions
 *
 * @param context - The Twilio Functions context
 * @param callback - The Twilio Functions callback
 * @param headers - Optional additional headers
 * @returns - Object with headers for CORS
 */
export function setCorsHeaders(
  context: Context,
  callback?: ServerlessCallback,
  headers: Record<string, string> = {}
): Record<string, string> {
  const defaultHeaders = {
    'Access-Control-Allow-Origin': context.UI_BASE_URL || '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
    ...headers,
  };

  // If this is a preflight request, return 200 with appropriate headers
  if (callback) {
    callback(null, {
      headers: defaultHeaders,
      statusCode: 200,
    });
  }

  return defaultHeaders;
}

/**
 * Handle preflight OPTIONS requests for CORS
 *
 * @param context - The Twilio Functions context
 * @param callback - The Twilio Functions callback
 */
export function handlePreflight(
  context: Context,
  callback: ServerlessCallback
): void {
  setCorsHeaders(context, callback);
}