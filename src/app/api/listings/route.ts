import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';
import { itemReportSchema } from '@/lib/validations';
import { generateReferenceId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const type = searchParams.get('type')?.toUpperCase();
    const category = searchParams.get('category');
    const city = searchParams.get('city')?.trim();
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const featured = searchParams.get('featured') === 'true';
    const userId = searchParams.get('userId');

    // Build Prisma where clause
    const where: any = {};

    // For public browse, only show APPROVED items unless filtered by specific status (or user looking at their own items)
    if (userId) {
      where.userId = userId;
      if (status && status !== 'ALL') {
        where.status = status;
      }
    } else {
      if (status && status !== 'ALL') {
        where.status = status;
      } else {
        where.status = { in: ['APPROVED', 'MATCHED'] };
      }
    }

    if (type && (type === 'LOST' || type === 'FOUND')) {
      where.type = type;
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (category && category !== 'all') {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    if (city && city !== 'all') {
      where.city = {
        contains: city,
      };
    }

    if (q) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { brand: { contains: q } },
            { approxLocation: { contains: q } },
            { city: { contains: q } },
            { referenceId: { contains: q } },
          ],
        },
      ];
    }

    // Determine orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'date_lost_newest') {
      orderBy = { dateLostFound: 'desc' };
    } else if (sort === 'date_lost_oldest') {
      orderBy = { dateLostFound: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, iconName: true },
          },
          images: {
            select: { id: true, url: true, isPrimary: true },
          },
          user: {
            select: { id: true, name: true, city: true }, // NO private email or phone exposed!
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Listings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse('You must be signed in to submit a report');
    }

    const body = await request.json();
    const validated = itemReportSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;
    const referenceId = generateReferenceId('ITEM');

    // Items go into UNDER_REVIEW — admin must approve before they appear publicly
    const status = 'UNDER_REVIEW';

    const item = await prisma.item.create({
      data: {
        referenceId,
        type: data.type,
        title: data.title,
        description: data.description,
        brand: data.brand || null,
        dateLostFound: new Date(data.dateLostFound),
        approxLocation: data.approxLocation,
        city: data.city,
        preferredContactMethod: data.preferredContactMethod,
        privacyPreference: data.privacyPreference,
        rewardAmount: data.type === 'LOST' ? (data.rewardAmount || null) : null,
        status,
        userId: user.id,
        categoryId: data.categoryId,
        images: {
          create: data.images.map((url, index) => ({
            url,
            isPrimary: index === 0,
          })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    // Notify user of report creation
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'STATUS_UPDATE',
        title: `Report Submitted (${item.referenceId})`,
        message: `Your ${item.type.toLowerCase()} item report "${item.title}" is now active with reference ${item.referenceId}.`,
        linkUrl: `/listings/${item.id}`,
      },
    });

    return NextResponse.json({
      message: 'Report submitted successfully',
      item,
      referenceId: item.referenceId,
    });
  } catch (error) {
    console.error('Listings POST error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
