import { ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import { Context } from '../../../types/context';
import { setCorsHeaders, handlePreflight } from '../../../utils/cors-handler';

interface VoiceTokenEvent {
  identity?: string;
  [key: string]: any;
}

export const handler: ServerlessFunctionSignature = async function(
  context: Context,
  event: VoiceTokenEvent,
  callback: ServerlessCallback
) {
  // Handle preflight OPTIONS request
  if (context.METHOD === 'OPTIONS') {
    return handlePreflight(context, callback);
  }

  const headers = setCorsHeaders(context);

  try {
    const { identity } = event;

    if (!identity || typeof identity !== 'string') {
      return callback(null, {
        headers,
        statusCode: 400,
        body: JSON.stringify({ error: 'Identity is required' })
      });
    }

    // Check if required environment variables are present
    if (!context.ACCOUNT_SID || !context.TWILIO_API_KEY || !context.TWILIO_API_SECRET) {
      console.error('Missing Twilio credentials');
      return callback(null, {
        headers,
        statusCode: 500,
        body: JSON.stringify({ error: 'Twilio Voice not configured' })
      });
    }

    // Create an access token
    const AccessToken = require('twilio').jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      context.ACCOUNT_SID as string,
      context.TWILIO_API_KEY as string,
      context.TWILIO_API_SECRET as string,
      { identity: identity }
    );

    // Create a Voice grant for this token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: context.TWILIO_TWIML_APP_SID as string,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    return callback(null, {
      headers,
      statusCode: 200,
      body: JSON.stringify({
        identity: identity,
        token: token.toJwt(),
      })
    });
  } catch (error) {
    console.error('Error generating voice token:', error);
    return callback(null, {
      headers,
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate voice token' })
    });
  }
};