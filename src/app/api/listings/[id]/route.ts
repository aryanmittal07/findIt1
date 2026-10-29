import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { maskContact } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const currentUser = await getCurrentUser(request);

    // Can query by internal ID or referenceId
    const item = await prisma.item.findFirst({
      where: {
        OR: [{ id }, { referenceId: id }],
      },
      include: {
        category: true,
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const isOwner = currentUser?.id === item.userId;
    const isAdmin = currentUser?.role === 'ADMIN';

    // Privacy protection: Mask reporter contact details for non-owners/non-admins
    const sanitizedUser = {
      id: item.user.id,
      name: item.user.name,
      city: item.user.city,
      maskedEmail: maskContact(item.user.email, 'email'),
      maskedPhone: maskContact(item.user.phone, 'phone'),
      // Only reveal full details if viewer is owner or admin
      email: isOwner || isAdmin ? item.user.email : null,
      phone: isOwner || isAdmin ? item.user.phone : null,
    };

    // Find potential matches in opposite type (e.g. if this is LOST, find FOUND in same category)
    const oppositeType = item.type === 'LOST' ? 'FOUND' : 'LOST';
    const potentialMatches = await prisma.item.findMany({
      where: {
        id: { not: item.id },
        type: oppositeType,
        categoryId: item.categoryId,
        status: 'APPROVED',
      },
      include: {
        images: true,
        category: true,
      },
      take: 4,
    });

    return NextResponse.json({
      item: {
        ...item,
        user: sanitizedUser,
        isOwner,
        isAdmin,
      },
      potentialMatches,
    });
  } catch (error) {
    console.error('Listing GET by ID error:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = params;
    const item = await prisma.item.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
    });

    if (!item) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const isOwner = user.id === item.userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return forbiddenResponse('You can only edit your own listings');
    }

    const body = await request.json();

    // Only admin can set status to RESOLVED — owners cannot self-resolve
    if (body.status === 'RESOLVED' && !isAdmin) {
      return forbiddenResponse('Only admin can mark a listing as resolved');
    }

    const updated = await prisma.item.update({
      where: { id: item.id },
      data: {
        title: body.title !== undefined ? body.title : item.title,
        description: body.description !== undefined ? body.description : item.description,
        brand: body.brand !== undefined ? body.brand : item.brand,
        approxLocation: body.approxLocation !== undefined ? body.approxLocation : item.approxLocation,
        city: body.city !== undefined ? body.city : item.city,
        rewardAmount: body.rewardAmount !== undefined ? body.rewardAmount : item.rewardAmount,
        status: body.status !== undefined ? body.status : item.status,
        privacyPreference: body.privacyPreference !== undefined ? body.privacyPreference : item.privacyPreference,
        preferredContactMethod: body.preferredContactMethod !== undefined ? body.preferredContactMethod : item.preferredContactMethod,
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json({
      message: 'Listing updated successfully',
      item: updated,
    });
  } catch (error) {
    console.error('Listing update error:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = params;
    const item = await prisma.item.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
    });

    if (!item) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (user.id !== item.userId && user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    // Rather than hard delete, mark as CLOSED or delete if requested
    await prisma.item.update({
      where: { id: item.id },
      data: { status: 'CLOSED' },
    });

    return NextResponse.json({ message: 'Listing closed successfully' });
  } catch (error) {
    console.error('Listing delete/close error:', error);
    return NextResponse.json({ error: 'Failed to close listing' }, { status: 500 });
  }
}
