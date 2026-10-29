import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { messageSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const requests = await prisma.contactRequest.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        item: {
          select: {
            id: true,
            referenceId: true,
            title: true,
            type: true,
            status: true,
            images: { take: 1 },
          },
        },
        sender: {
          select: { id: true, name: true, city: true },
        },
        receiver: {
          select: { id: true, name: true, city: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Contact requests GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contact requests' }, { status: 500 });
  }
}

// POST new message into existing thread
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validated = messageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
    }

    const { contactRequestId, content } = validated.data;

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: contactRequestId },
      include: { item: true },
    });

    if (!contactRequest) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const isParticipant =
      contactRequest.senderId === user.id || contactRequest.receiverId === user.id;

    if (!isParticipant && user.role !== 'ADMIN') {
      return forbiddenResponse('You are not a participant in this conversation');
    }

    const message = await prisma.message.create({
      data: {
        contactRequestId,
        senderId: user.id,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });

    // Touch contactRequest updatedAt
    await prisma.contactRequest.update({
      where: { id: contactRequestId },
      data: { updatedAt: new Date() },
    });

    // Notify the other party
    const recipientId =
      contactRequest.senderId === user.id
        ? contactRequest.receiverId
        : contactRequest.senderId;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'CONTACT_REQUEST',
        title: `New message from ${user.name}`,
        message: content.length > 60 ? `${content.slice(0, 60)}...` : content,
        linkUrl: `/dashboard?tab=requests`,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Post message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// PATCH update request status (ACCEPT or DECLINE)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { requestId, status } = body;

    if (!requestId || !['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request status' }, { status: 400 });
    }

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: requestId },
      include: { item: true },
    });

    if (!contactRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Only receiver or admin can accept/decline
    if (contactRequest.receiverId !== user.id && user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const updated = await prisma.contactRequest.update({
      where: { id: requestId },
      data: { status },
    });

    // Notify sender of status
    await prisma.notification.create({
      data: {
        userId: contactRequest.senderId,
        type: 'CONTACT_REQUEST',
        title: `Contact Request ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'}`,
        message: `${user.name} has ${status.toLowerCase()} your contact request regarding "${contactRequest.item.title}".`,
        linkUrl: `/dashboard?tab=requests`,
      },
    });

    return NextResponse.json({
      message: `Request ${status.toLowerCase()}`,
      contactRequest: updated,
    });
  } catch (error) {
    console.error('Update request status error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
