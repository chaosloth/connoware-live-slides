import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import fs from 'fs/promises';
import path from 'path';

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
const envPath = path.join(process.cwd(), '.env');

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload.phoneNumber as string;
  } catch {
    return null;
  }
}

async function getAuthorizedNumbers(): Promise<string[]> {
  const numbers = process.env.AUTHORIZED_PHONE_NUMBERS || '';
  return numbers.split(',').filter(Boolean).map(n => n.trim());
}

async function updateEnvFile(numbers: string[]) {
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const lines = envContent.split('\n');

    const updatedLines = lines.map(line => {
      if (line.startsWith('AUTHORIZED_PHONE_NUMBERS=')) {
        return `AUTHORIZED_PHONE_NUMBERS=${numbers.join(',')}`;
      }
      return line;
    });

    await fs.writeFile(envPath, updatedLines.join('\n'), 'utf-8');

    // Update process.env for current session
    process.env.AUTHORIZED_PHONE_NUMBERS = numbers.join(',');

    return true;
  } catch (error) {
    console.error('Error updating .env file:', error);
    return false;
  }
}

// GET - List authorized users
export async function GET(request: NextRequest) {
  const phoneNumber = await verifyToken(request);

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const numbers = await getAuthorizedNumbers();

  return NextResponse.json({
    users: numbers.map(number => ({ phoneNumber: number }))
  });
}

// POST - Add new authorized user
export async function POST(request: NextRequest) {
  const phoneNumber = await verifyToken(request);

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newPhoneNumber } = await request.json();

    if (!newPhoneNumber || typeof newPhoneNumber !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!newPhoneNumber.startsWith('+')) {
      return NextResponse.json(
        { error: 'Phone number must be in E.164 format' },
        { status: 400 }
      );
    }

    const numbers = await getAuthorizedNumbers();

    if (numbers.includes(newPhoneNumber)) {
      return NextResponse.json(
        { error: 'Phone number already authorized' },
        { status: 400 }
      );
    }

    numbers.push(newPhoneNumber);
    const success = await updateEnvFile(numbers);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update authorized users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, phoneNumber: newPhoneNumber });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json(
      { error: 'Failed to add user' },
      { status: 500 }
    );
  }
}

// DELETE - Remove authorized user
export async function DELETE(request: NextRequest) {
  const phoneNumber = await verifyToken(request);

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { removePhoneNumber } = await request.json();

    if (!removePhoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const numbers = await getAuthorizedNumbers();

    // Prevent removing yourself if you're the last user
    if (numbers.length === 1 && numbers[0] === phoneNumber) {
      return NextResponse.json(
        { error: 'Cannot remove the last authorized user' },
        { status: 400 }
      );
    }

    const filteredNumbers = numbers.filter(n => n !== removePhoneNumber);

    if (filteredNumbers.length === numbers.length) {
      return NextResponse.json(
        { error: 'Phone number not found' },
        { status: 404 }
      );
    }

    const success = await updateEnvFile(filteredNumbers);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update authorized users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json(
      { error: 'Failed to remove user' },
      { status: 500 }
    );
  }
}
