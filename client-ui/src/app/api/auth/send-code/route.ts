import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// List of authorized phone numbers (E.164 format)
const AUTHORIZED_NUMBERS = (process.env.AUTHORIZED_PHONE_NUMBERS || '').split(',').filter(Boolean);

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate E.164 format (starts with +)
    if (!phoneNumber.startsWith('+')) {
      return NextResponse.json(
        { error: 'Phone number must be in E.164 format (e.g., +1234567890)' },
        { status: 400 }
      );
    }

    // Check if phone number is authorized
    if (!AUTHORIZED_NUMBERS.includes(phoneNumber)) {
      return NextResponse.json(
        { error: 'This phone number is not authorized' },
        { status: 403 }
      );
    }

    if (!verifyServiceSid) {
      return NextResponse.json(
        { error: 'Twilio Verify not configured' },
        { status: 500 }
      );
    }

    // Send verification code
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    return NextResponse.json({
      success: true,
      status: verification.status
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
