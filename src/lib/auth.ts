import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';
import { prisma } from './prisma';

export async function getCurrentUser(request: NextRequest): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  role: string;
  status: string;
} | null> {
  const token =
    request.cookies.get('findit_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status === 'SUSPENDED') {
    return null;
  }

  return user;
}

export function unauthorizedResponse(message = 'Authentication required') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'You do not have permission to perform this action') {
  return NextResponse.json({ error: message }, { status: 403 });
}
