import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }
    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { itemId, action, status, moderationNotes, isFeatured } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { user: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (moderationNotes !== undefined) updateData.moderationNotes = moderationNotes;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
    });

    // Notify item owner of status change if status changed
    if (status && status !== item.status) {
      await prisma.notification.create({
        data: {
          userId: item.userId,
          type: 'STATUS_UPDATE',
          title: `Listing Status Changed: ${status}`,
          message: moderationNotes
            ? `Admin note: ${moderationNotes}`
            : `Your listing "${item.title}" status has been updated to ${status}.`,
          linkUrl: `/listings/${item.id}`,
        },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: action || `UPDATE_STATUS_${status || 'GENERAL'}`,
        targetType: 'ITEM',
        targetId: item.id,
        details: `Item ${item.referenceId}: status=${status || item.status}, featured=${isFeatured !== undefined ? isFeatured : item.isFeatured}`,
      },
    });

    return NextResponse.json({
      message: 'Item updated successfully',
      item: updated,
    });
  } catch (error) {
    console.error('Admin moderation error:', error);
    return NextResponse.json({ error: 'Failed to moderate item' }, { status: 500 });
  }
}
