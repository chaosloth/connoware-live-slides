// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import { ServerlessCallback, ServerlessFunctionSignature } from "@twilio-labs/serverless-runtime-types/types";
import { Context } from '../../../types/context';

interface SendCodeEvent {
  phoneNumber?: string;
  [key: string]: any;
}

/**
 * Get list of authorized phone numbers from environment
 *
 * @param context - Twilio Functions context
 * @returns - Array of authorized phone numbers
 */
function getAuthorizedNumbers(context: Context): string[] {
  const numbers = context.AUTHORIZED_PHONE_NUMBERS || '';
  console.log("Raw AUTHORIZED_PHONE_NUMBERS value:", numbers);

  if (!numbers) {
    console.warn("No authorized phone numbers configured in environment");
    return [];
  }

  const phoneNumbers = numbers.split(',').filter(Boolean).map(n => n.trim());
  console.log(`Parsed ${phoneNumbers.length} authorized phone numbers from environment`);
  return phoneNumbers;
}

export const handler: ServerlessFunctionSignature = async (
  context: Context,
  event: SendCodeEvent,
  callback: ServerlessCallback
) => {
  console.log("event received - /api/auth/send-code: ", event);

  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.appendHeader(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,Accept"
  );
  response.appendHeader("Content-Type", "application/json");

  try {
    const { phoneNumber } = event;
    console.log("Phone number from request:", phoneNumber);

    if (!phoneNumber || phoneNumber === '') {
      console.log("Phone number missing or empty");
      response.setStatusCode(400);
      response.setBody({ error: "Phone number is required" });
      return callback(null, response);
    }

    // Check if number is in proper E.164 format
    if (!phoneNumber.startsWith('+')) {
      console.log("Phone number not in E.164 format:", phoneNumber);
      response.setStatusCode(400);
      response.setBody({ error: "Phone number must be in E.164 format (e.g., +1234567890)" });
      return callback(null, response);
    }

    // Check if number is in authorized list
    try {
      const authorizedNumbers = getAuthorizedNumbers(context);
      console.log("Checking authorization for:", phoneNumber);
      console.log("Authorized numbers:", authorizedNumbers);

      if (!authorizedNumbers.includes(phoneNumber)) {
        console.log("Unauthorized access attempt:", phoneNumber);
        response.setStatusCode(403);
        response.setBody({ error: "This phone number is not authorized" });
        return callback(null, response);
      }

      console.log("Phone number is authorized!");
    } catch (authError: any) {
      console.error("Error checking authorization:", authError);
      response.setStatusCode(500);
      response.setBody({ error: "Failed to check authorization" });
      return callback(null, response);
    }

    // Check Verify service SID
    if (!context.TWILIO_VERIFY_SERVICE_SID) {
      console.error("TWILIO_VERIFY_SERVICE_SID not configured");
      response.setStatusCode(500);
      response.setBody({ error: "Twilio Verify service not configured" });
      return callback(null, response);
    }

    console.log("Attempting to send verification code via Twilio Verify API");
    const client = context.getTwilioClient();

    try {
      // Send verification code
      const verification = await client.verify.v2
        .services(context.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms'
        });

      console.log("Verification sent successfully:", verification.status);

      response.setStatusCode(200);
      response.setBody({
        success: true,
        status: verification.status
      });
      return callback(null, response);

    } catch (verifyError: any) {
      console.error("Twilio Verify API error:", verifyError);

      if (verifyError.code) {
        console.error("Error code:", verifyError.code);
      }

      if (verifyError.message) {
        console.error("Error message:", verifyError.message);
      }

      response.setStatusCode(500);
      response.setBody({
        error: "Failed to send verification code",
        message: verifyError.message || "Unknown Verify API error"
      });
      return callback(null, response);
    }
  } catch (err: any) {
    console.error("General handler error:", err);
    console.error("Error stack:", err.stack);

    response.setStatusCode(500);
    response.setBody({
      error: "Failed to process request",
      message: err.message || "Unknown error"
    });
    return callback(null, response);
  }
};