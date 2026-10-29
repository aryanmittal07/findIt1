import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Signed out successfully' });
  response.cookies.delete('findit_token');
  return response;
}
