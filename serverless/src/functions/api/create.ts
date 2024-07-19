// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  WORKSPACE_SID: string;
  WORKFLOW_SID: string;
};

type MyEvent = {
  task_type: string;
  attributes: any;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    const response = new Twilio.Response();
    // Set the CORS headers to allow Flex to make an error-free HTTP request
    // to this Function
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    response.appendHeader("Content-Type", "application/json");

    console.log(">>> INCOMING >>>");
    console.log(event);

    // Ignore events for recordings that aren't completed
    if (!event.task_type) {
      console.log(`Ignoring incoming task creation request, no task type`);
      response.setBody({ status: "Missing required params" });
      response.setStatusCode(400);
      return callback(null, response);
    }

    // Ignore events for recordings that aren't completed
    if (
      !event.attributes ||
      !event.attributes["phone"] ||
      !event.attributes["worker_friendly_name"]
    ) {
      console.log(`Missing phone or worker_friendly_name`);
      response.setBody({ status: "Missing required params" });
      response.setStatusCode(400);
      return callback(null, response);
    }

    try {
      // Create task
      let client = context.getTwilioClient();
      let task = await client.taskrouter.v1
        .workspaces(context.WORKSPACE_SID)
        .tasks.create({
          taskChannel: event.task_type,
          attributes: JSON.stringify({
            ...event.attributes,
          }),
          workflowSid: context.WORKFLOW_SID,
        });

      console.log(`Created task ${task.sid}`);
      response.setBody({ status: "created" });
      return callback(null, response);
    } catch (e: any) {
      console.error(`Failed to create task ` + event.task_type);
      response.setStatusCode(500);
      console.error(e);
      return callback(null, response);
    }
  };
