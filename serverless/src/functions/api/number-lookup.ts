import { ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import { Context } from '../../types/context';

interface NumberLookupEvent {
  From?: string;
  countryCode?: string;
  [key: string]: any;
}

/**
 * Phone number lookup function that formats phone numbers into E.164 format
 * Uses Twilio Lookup API if available, or falls back to a simple formatter
 */
export const handler: ServerlessFunctionSignature = async function(
  context: Context,
  event: NumberLookupEvent,
  callback: ServerlessCallback
) {
  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.appendHeader(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,Accept"
  );
  response.appendHeader("Content-Type", "application/json");

  console.log("event received - /api/number-lookup: ", event);

  try {
    const { countryCode = 'US', From } = event;

    if (!From) {
      response.setStatusCode(400);
      response.setBody({ error: 'Phone number is required' });
      return callback(null, response);
    }

    const client = context.getTwilioClient();

    try {
      // Try to use Twilio Lookup API for robust phone validation
      const result = await client.lookups
        .phoneNumbers(decodeURIComponent(From))
        .fetch({ countryCode });

      console.log(`Normalized to ${result.phoneNumber} (${result.nationalFormat})`);

      response.setStatusCode(200);
      response.setBody(result);
      return callback(null, response);
    } catch (lookupErr) {
      console.log("Lookup API error, falling back to simple formatting", lookupErr);

      // Simple formatter for E.164 format as fallback
      let phoneNumber = From.trim();

      // If number doesn't start with +, add country code
      if (!phoneNumber.startsWith('+')) {
        if (countryCode === 'US' && phoneNumber.length === 10) {
          phoneNumber = `+1${phoneNumber}`;
        } else if (phoneNumber.startsWith('1') && phoneNumber.length === 11) {
          phoneNumber = `+${phoneNumber}`;
        } else {
          // Add basic country code based on provided countryCode
          const countryCodes: Record<string, string> = {
            'US': '1',
            'AU': '61',
            'UK': '44',
            'GB': '44',
            // Add more country codes as needed
          };

          const code = countryCodes[countryCode] || '1'; // Default to US
          phoneNumber = `+${code}${phoneNumber}`;
        }
      }

      response.setStatusCode(200);
      response.setBody({
        phoneNumber,
        countryCode,
        nationalFormat: phoneNumber.replace(/^\+\d+/, '')
      });
      return callback(null, response);
    }
  } catch (error) {
    console.error('Error in number-lookup:', error);
    response.setStatusCode(500);
    response.setBody({ error: 'Failed to process phone number' });
    return callback(null, response);
  }
};
