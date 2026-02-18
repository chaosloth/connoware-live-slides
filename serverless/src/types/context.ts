import { Context as TwilioContext } from '@twilio-labs/serverless-runtime-types/types';

/**
 * Extended Context type with our environment variables
 */
export interface Context extends TwilioContext {
  // Basic Twilio credentials
  ACCOUNT_SID?: string;
  AUTH_TOKEN?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_API_KEY?: string;
  TWILIO_API_SECRET?: string;

  // Twilio services
  SYNC_SERVICE_SID?: string;
  CHAT_SERVICE_SID?: string;
  TWILIO_VERIFY_SERVICE_SID?: string;
  TWILIO_TWIML_APP_SID?: string;

  // Workflow-related (if needed)
  WORKSPACE_SID?: string;
  WORKFLOW_SID?: string;

  // Auth-related
  JWT_SECRET?: string;
  AUTHORIZED_PHONE_NUMBERS?: string;

  // OpenAI
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;

  // Cross-origin settings
  UI_BASE_URL?: string;

  // HTTP method (added by Twilio Functions runtime)
  METHOD?: string;

  // Authorization header
  AUTHORIZATION?: string;
}