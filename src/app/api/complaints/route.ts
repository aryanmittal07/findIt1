import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';
import { complaintSchema } from '@/lib/validations';
import { generateReferenceId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (user.role !== 'ADMIN') {
      where.userId = user.id;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Complaints GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse('You must be signed in to submit a complaint or support ticket');
    }

    const body = await request.json();
    const validated = complaintSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;
    const referenceId = generateReferenceId('COMPLAINT');

    const complaint = await prisma.complaint.create({
      data: {
        referenceId,
        subject: data.subject,
        category: data.category,
        description: data.description,
        itemReference: data.itemReference || null,
        priority: data.priority,
        attachmentUrl: data.attachmentUrl || null,
        status: 'PENDING',
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'COMPLAINT_UPDATE',
        title: `Complaint Logged (${referenceId})`,
        message: `Your request "${complaint.subject}" has been received and queued for review. Reference: ${referenceId}`,
        linkUrl: '/dashboard?tab=complaints',
      },
    });

    return NextResponse.json({
      message: 'Complaint submitted successfully',
      complaint,
      referenceId,
    });
  } catch (error) {
    console.error('Complaint POST error:', error);
    return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 });
  }
}
