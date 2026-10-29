import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    const pendingRequestsCount = await prisma.contactRequest.count({
      where: {
        receiverId: user.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      user,
      unreadNotifications,
      pendingRequestsCount,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null });
  }
}
