import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse('Only administrators can update complaint status and responses');
    }

    const { id } = params;
    const complaint = await prisma.complaint.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, adminResponse } = body;

    const updated = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: status || complaint.status,
        adminResponse: adminResponse !== undefined ? adminResponse : complaint.adminResponse,
        resolvedAt: status === 'RESOLVED' ? new Date() : complaint.resolvedAt,
      },
    });

    // Notify user of admin update
    await prisma.notification.create({
      data: {
        userId: complaint.userId,
        type: 'COMPLAINT_UPDATE',
        title: `Complaint Status Updated: ${status || complaint.status}`,
        message: adminResponse
          ? `FindIt Support replied: "${adminResponse.slice(0, 80)}..."`
          : `Your complaint (${complaint.referenceId}) was marked as ${status}.`,
        linkUrl: '/dashboard?tab=complaints',
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: 'UPDATE_COMPLAINT_STATUS',
        targetType: 'COMPLAINT',
        targetId: complaint.id,
        details: `Updated complaint ${complaint.referenceId} to status "${status}" with response.`,
      },
    });

    return NextResponse.json({
      message: 'Complaint updated successfully',
      complaint: updated,
    });
  } catch (error) {
    console.error('Complaint PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
