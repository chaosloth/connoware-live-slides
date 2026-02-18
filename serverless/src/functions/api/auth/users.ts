// Import types
import "@twilio-labs/serverless-runtime-types";
import { ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import { Context } from '../../../types/context';
import { verifyToken } from '../../../utils/auth-helper';

interface UsersEvent {
  newPhoneNumber?: string;
  removePhoneNumber?: string;
  authorization?: string;
  [key: string]: any;
}

/**
 * Get list of authorized phone numbers from environment
 *
 * @param context - Twilio Functions context
 * @returns - Array of authorized phone numbers
 */
function getAuthorizedNumbers(context: Context): string[] {
  const numbers = context.AUTHORIZED_PHONE_NUMBERS || "";
  console.log("Raw AUTHORIZED_PHONE_NUMBERS value:", numbers);

  if (!numbers) {
    console.warn("No authorized phone numbers configured in environment");
    return [];
  }

  const phoneNumbers = numbers.split(",").filter(Boolean).map(n => n.trim());
  console.log(`Parsed ${phoneNumbers.length} authorized phone numbers from environment`);
  return phoneNumbers;
}

/**
 * Update environment file with new phone numbers
 *
 * @param context - Twilio Functions context
 * @param numbers - Array of phone numbers to save
 * @returns - True if successful, false if failed
 */
async function updateAuthorizedNumbers(
  context: Context,
  numbers: string[]
): Promise<boolean> {
  try {
    console.log("Updating authorized numbers:", numbers);

    // NOTE: This function is modified for serverless environment
    // Instead of directly modifying .env file, we'll store in Sync
    const client = context.getTwilioClient();

    // Store authorized numbers in a Sync document for persistence
    // This approach is safer than modifying environment files in serverless functions
    if (context.SYNC_SERVICE_SID) {
      console.log("Using Sync service to store authorized numbers");
      try {
        await client.sync.v1
          .services(context.SYNC_SERVICE_SID as string)
          .documents
          .create({
            uniqueName: 'authorized_phone_numbers',
            data: { numbers },
          });
        console.log("Successfully stored numbers in Sync document");
      } catch (syncError: any) {
        console.error("Error creating Sync document:", syncError.message);

        // Try to update existing document if it exists
        try {
          console.log("Trying to update existing Sync document");
          await client.sync.v1
            .services(context.SYNC_SERVICE_SID as string)
            .documents('authorized_phone_numbers')
            .update({ data: { numbers } });
          console.log("Successfully updated existing Sync document");
        } catch (updateError: any) {
          console.error("Error updating Sync document:", updateError.message);
          throw updateError;
        }
      }
    } else {
      console.warn("SYNC_SERVICE_SID not configured, skipping persistent storage");
    }

    // For compatibility, also update the environment variable in current context
    // This won't persist between function invocations but helps with current request
    context.AUTHORIZED_PHONE_NUMBERS = numbers.join(',');
    console.log("Updated in-memory AUTHORIZED_PHONE_NUMBERS");

    return true;
  } catch (error: any) {
    console.error('Error updating authorized numbers:', error.message);
    console.error('Error stack:', error.stack || 'No stack trace available');
    return false;
  }
}

export const handler: ServerlessFunctionSignature = async (
  context: Context,
  event: UsersEvent,
  callback: ServerlessCallback
) => {
  console.log("event received - /api/auth/users: ", event);

  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.appendHeader(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,Accept"
  );
  response.appendHeader("Content-Type", "application/json");

  try {
    // Verify JWT token from Authorization header
    const authHeader = context.AUTHORIZATION || event.authorization;
    console.log("Authorization header present:", !!authHeader);

    console.log("Verifying JWT token");
    const payload = await verifyToken(context, authHeader);
    console.log("Token verification result:", payload ? "valid" : "invalid");

    if (!payload || !payload.phoneNumber) {
      console.log('Unauthorized - invalid or missing JWT token');
      response.setStatusCode(401);
      response.setBody({ error: 'Unauthorized' });
      return callback(null, response);
    }

    const phoneNumber = payload.phoneNumber as string;

    // Handle GET request - List authorized users
    if (context.METHOD === 'GET') {
      const numbers = getAuthorizedNumbers(context);

      response.setStatusCode(200);
      response.setBody({
        users: numbers.map(number => ({ phoneNumber: number }))
      });
      return callback(null, response);
    }

    // Handle POST request - Add new authorized user
    if (context.METHOD === 'POST') {
      const { newPhoneNumber } = event;

      if (!newPhoneNumber || typeof newPhoneNumber !== 'string') {
        console.log('Missing phone number in POST request');
        response.setStatusCode(400);
        response.setBody({ error: 'Phone number is required' });
        return callback(null, response);
      }

      if (!newPhoneNumber.startsWith('+')) {
        console.log('Invalid phone number format:', newPhoneNumber);
        response.setStatusCode(400);
        response.setBody({ error: 'Phone number must be in E.164 format' });
        return callback(null, response);
      }

      const numbers = getAuthorizedNumbers(context);

      if (numbers.includes(newPhoneNumber)) {
        console.log('Phone number already authorized:', newPhoneNumber);
        response.setStatusCode(400);
        response.setBody({ error: 'Phone number already authorized' });
        return callback(null, response);
      }

      numbers.push(newPhoneNumber);
      const success = await updateAuthorizedNumbers(context, numbers);

      if (!success) {
        console.error('Failed to update authorized users');
        response.setStatusCode(500);
        response.setBody({ error: 'Failed to update authorized users' });
        return callback(null, response);
      }

      console.log('Successfully added authorized user:', newPhoneNumber);
      response.setStatusCode(200);
      response.setBody({ success: true, phoneNumber: newPhoneNumber });
      return callback(null, response);
    }

    // Handle DELETE request - Remove authorized user
    if (context.METHOD === 'DELETE') {
      const { removePhoneNumber } = event;

      if (!removePhoneNumber) {
        console.log('Missing phone number in DELETE request');
        response.setStatusCode(400);
        response.setBody({ error: 'Phone number is required' });
        return callback(null, response);
      }

      const numbers = getAuthorizedNumbers(context);

      // Prevent removing yourself if you're the last user
      if (numbers.length === 1 && numbers[0] === phoneNumber) {
        console.log('Attempted to remove last authorized user');
        response.setStatusCode(400);
        response.setBody({ error: 'Cannot remove the last authorized user' });
        return callback(null, response);
      }

      const filteredNumbers = numbers.filter(n => n !== removePhoneNumber);

      if (filteredNumbers.length === numbers.length) {
        console.log('Phone number not found for removal:', removePhoneNumber);
        response.setStatusCode(404);
        response.setBody({ error: 'Phone number not found' });
        return callback(null, response);
      }

      const success = await updateAuthorizedNumbers(context, filteredNumbers);

      if (!success) {
        console.error('Failed to update authorized users during deletion');
        response.setStatusCode(500);
        response.setBody({ error: 'Failed to update authorized users' });
        return callback(null, response);
      }

      console.log('Successfully removed user:', removePhoneNumber);
      response.setStatusCode(200);
      response.setBody({ success: true });
      return callback(null, response);
    }

    // If we get here, it's an unsupported method
    console.log('Unsupported HTTP method:', context.METHOD);
    response.setStatusCode(405);
    response.setBody({ error: 'Method not allowed' });
    return callback(null, response);
  } catch (err: any) {
    console.error('Error processing request:', err);
    console.error('Error stack:', err.stack);

    response.setStatusCode(500);
    response.setBody({
      error: 'Internal server error',
      message: err.message || 'Unknown error'
    });
    return callback(null, response);
  }
};