import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { SignJWT } from 'jose';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      );
    }

    if (!verifyServiceSid) {
      return NextResponse.json(
        { error: 'Twilio Verify not configured' },
        { status: 500 }
      );
    }

    // Verify the code
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phoneNumber, code });

    if (verificationCheck.status === 'approved') {
      // Create JWT token
      const token = await new SignJWT({ phoneNumber })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(jwtSecret);

      return NextResponse.json({
        success: true,
        token,
        phoneNumber
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
