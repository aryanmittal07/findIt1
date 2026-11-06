import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ message: 'Signed out successfully' });
  response.cookies.delete('findit_token');
  return response;
}
