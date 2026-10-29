import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }
    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const [
      totalReports,
      lostReports,
      foundReports,
      pendingReview,
      resolvedReports,
      totalUsers,
      pendingComplaints,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({ where: { type: 'LOST' } }),
      prisma.item.count({ where: { type: 'FOUND' } }),
      prisma.item.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.item.count({ where: { status: 'RESOLVED' } }),
      prisma.user.count(),
      prisma.complaint.count({ where: { status: { in: ['PENDING', 'INVESTIGATING'] } } }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalReports,
        lostReports,
        foundReports,
        pendingReview,
        resolvedReports,
        totalUsers,
        pendingComplaints,
      },
      recentAuditLogs,
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
