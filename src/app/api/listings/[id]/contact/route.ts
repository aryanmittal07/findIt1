import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';
import { contactRequestSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse('You must be signed in to contact the reporter');
    }

    const { id } = params;
    const item = await prisma.item.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
      include: { user: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (item.userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot send a contact request on your own listing' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = contactRequestSchema.safeParse({ ...body, itemId: item.id });

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { initialMessage, verificationDetails } = validated.data;

    // Check if an active request already exists
    const existing = await prisma.contactRequest.findFirst({
      where: {
        itemId: item.id,
        senderId: user.id,
      },
    });

    if (existing) {
      // Append new message instead of duplicate request
      const msg = await prisma.message.create({
        data: {
          contactRequestId: existing.id,
          senderId: user.id,
          content: initialMessage,
        },
      });

      return NextResponse.json({
        message: 'Message added to your existing inquiry thread',
        contactRequest: existing,
        newMessage: msg,
      });
    }

    // Create new contact request and first message
    const contactRequest = await prisma.contactRequest.create({
      data: {
        itemId: item.id,
        senderId: user.id,
        receiverId: item.userId,
        status: 'PENDING',
        initialMessage,
        verificationDetails: verificationDetails || null,
        messages: {
          create: [
            {
              senderId: user.id,
              content: initialMessage,
            },
          ],
        },
      },
      include: {
        messages: true,
      },
    });

    // Notify item owner
    await prisma.notification.create({
      data: {
        userId: item.userId,
        type: 'CONTACT_REQUEST',
        title: `Inquiry received for "${item.title}"`,
        message: `${user.name} sent a protected contact request for ${item.referenceId}.`,
        linkUrl: `/dashboard?tab=requests`,
      },
    });

    return NextResponse.json({
      message: 'Contact request sent securely. The reporter will be notified.',
      contactRequest,
    });
  } catch (error) {
    console.error('Contact request error:', error);
    return NextResponse.json({ error: 'Failed to submit contact request' }, { status: 500 });
  }
}
