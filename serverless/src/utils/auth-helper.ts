import { Context } from '../types/context';
import { jwtVerify, JWTPayload } from 'jose';

/**
 * Verify JWT token from Authorization header
 *
 * @param context - Twilio Functions context
 * @param authHeader - Authorization header value
 * @returns - Payload if valid, null if invalid
 */
export async function verifyToken(
  context: Context,
  authHeader: string | undefined
): Promise<JWTPayload | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const jwtSecret = new TextEncoder().encode(context.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get list of authorized phone numbers from environment
 *
 * @param context - Twilio Functions context
 * @returns - Array of authorized phone numbers
 */
export function getAuthorizedNumbers(context: Context): string[] {
  const numbers = context.AUTHORIZED_PHONE_NUMBERS || '';
  return numbers.split(',').filter(Boolean).map(n => n.trim());
}