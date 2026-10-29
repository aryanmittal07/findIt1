import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    // Get all user's active items
    const userItems = await prisma.item.findMany({
      where: {
        userId: user.id,
        status: { in: ['APPROVED', 'MATCHED'] },
      },
      include: {
        category: true,
        images: true,
      },
    });

    if (userItems.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const matchesList: any[] = [];

    for (const item of userItems) {
      const oppositeType = item.type === 'LOST' ? 'FOUND' : 'LOST';

      // Find opposite items in the same category or city
      const candidates = await prisma.item.findMany({
        where: {
          userId: { not: user.id },
          type: oppositeType,
          status: { in: ['APPROVED', 'MATCHED'] },
          OR: [
            { categoryId: item.categoryId },
            { city: { contains: item.city } },
          ],
        },
        include: {
          category: true,
          images: true,
          user: {
            select: { id: true, name: true, city: true },
          },
        },
        take: 6,
      });

      for (const candidate of candidates) {
        // Calculate match score
        let score = 50;
        const reasons: string[] = [];

        if (candidate.categoryId === item.categoryId) {
          score += 25;
          reasons.push(`Same category (${candidate.category.name})`);
        }

        if (
          candidate.city.toLowerCase().includes(item.city.toLowerCase()) ||
          item.city.toLowerCase().includes(candidate.city.toLowerCase())
        ) {
          score += 15;
          reasons.push(`Same city (${item.city})`);
        }

        if (item.brand && candidate.brand && (
          item.brand.toLowerCase().includes(candidate.brand.toLowerCase()) ||
          candidate.brand.toLowerCase().includes(item.brand.toLowerCase())
        )) {
          score += 10;
          reasons.push(`Brand similarity (${item.brand})`);
        }

        matchesList.push({
          sourceItem: item,
          matchedItem: candidate,
          score: Math.min(98, score),
          reasons,
        });
      }
    }

    // Sort by match score descending
    matchesList.sort((a, b) => b.score - a.score);

    return NextResponse.json({ matches: matchesList });
  } catch (error) {
    console.error('Matches GET error:', error);
    return NextResponse.json({ error: 'Failed to calculate matches' }, { status: 500 });
  }
}
