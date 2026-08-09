import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: true, message: 'A security reset link has been dispatched to your email address.' });
}
