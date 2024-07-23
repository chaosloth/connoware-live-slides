// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

export type MyContext = {
  getTwilioClient: any;
  TWILIO_ACCOUNT_SID: string;
  ACCOUNT_SID: string;
};

export type MyEvent = {
  From: string;
  countryCode: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = async (
  context: MyContext,
  event: MyEvent,
  callback: ServerlessCallback
) => {
  console.log("event received - /api/number-lookup: ", event);

  // The pre-initialized Twilio Client is available from the `context` object
  const client = context.getTwilioClient();
  const response = new Twilio.Response();

  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  // The From value is provided by Twilio to this webhook Function, and contains the caller's
  // phone number in E.164 format, ex. '+15095550100'
  const from = event.From;
  const countryCode = event.countryCode;

  try {
    // Call Twilio Lookup to get information about the number, including its national format
    const result = await client.lookups
      .phoneNumbers(decodeURIComponent(from))
      .fetch({ countryCode });
    console.log(`Normalized to ${result.nationalFormat}`);
    response.setBody(result);
    return callback(null, response);
  } catch (err) {
    response.setBody({ status: "Error" });
    response.setStatusCode(500);
    console.log("Error lookup up number", err);
    return callback(null, response);
  }
};
