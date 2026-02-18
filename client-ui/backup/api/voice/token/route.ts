import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

export async function POST(request: NextRequest) {
  try {
    const { identity } = await request.json();

    if (!identity || typeof identity !== 'string') {
      return NextResponse.json(
        { error: 'Identity is required' },
        { status: 400 }
      );
    }

    if (!accountSid || !apiKey || !apiSecret) {
      console.error('Missing Twilio credentials');
      return NextResponse.json(
        { error: 'Twilio Voice not configured' },
        { status: 500 }
      );
    }

    // Create an access token
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { identity: identity }
    );

    // Create a Voice grant for this token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    return NextResponse.json({
      identity: identity,
      token: token.toJwt(),
    });
  } catch (error) {
    console.error('Error generating voice token:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice token' },
      { status: 500 }
    );
  }
}
