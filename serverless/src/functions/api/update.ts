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
  TWILIO_API_KEY: string;
  TWILIO_API_SECRET: string;
  SYNC_SERVICE_SID: string;
  UI_BASE_URL: string;
};

export type MyEvent = {
  pid: string;
  sid: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = async (
  context: MyContext,
  event: MyEvent,
  callback: ServerlessCallback
) => {
  console.log("event received - /api/update: ", event);

  const SYNC_SERVICE_SID = context.SYNC_SERVICE_SID;

  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.appendHeader(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,Accept"
  );

  if (!event.pid || event.pid == "") {
    console.log("Missing pid in request");
    response.setStatusCode(400);
    response.setBody({ status: "missing pid" });
    return callback(null, response);
  }

  if (!event.sid || event.sid == "") {
    console.log("Missing sid in request");
    response.setStatusCode(400);
    response.setBody({ status: "missing sid" });
    return callback(null, response);
  }

  try {
    const client = context.getTwilioClient();

    await client.sync.v1
      .services(context.SYNC_SERVICE_SID)
      .documents(`STATE-${event.pid}`)
      .update({
        data: {
          currentSlideId: event.sid,
        },
      });

    // Redirect to a different URL
    response.appendHeader(
      "Location",
      `${context.UI_BASE_URL}/presenter?sid=${event.sid}`
    );
    response.setStatusCode(302);
  } catch (err) {
    console.error(`Error creating access token`, err);
    response.setStatusCode(500);
    response.setBody({ status: "Error update slide, see logs" });
  }

  return callback(null, response);
};
