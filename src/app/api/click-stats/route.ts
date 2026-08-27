import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const linkType = searchParams.get('linkType') || 'whatsapp_group';
    const days = parseInt(searchParams.get('days') || '30', 10);

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Total clicks
    const totalClicks = await prisma.linkClick.count({
      where: {
        linkType,
        createdAt: { gte: since },
      },
    });

    // Clicks by source
    const bySource = await prisma.linkClick.groupBy({
      by: ['source'],
      where: {
        linkType,
        createdAt: { gte: since },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // All-time total
    const allTimeTotal = await prisma.linkClick.count({
      where: { linkType },
    });

    // Recent clicks (last 20) for the log view
    const recentClicks = await prisma.linkClick.findMany({
      where: { linkType },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        source: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      linkType,
      days,
      totalClicks,
      allTimeTotal,
      bySource: bySource.map((s) => ({
        source: s.source,
        clicks: s._count.id,
      })),
      recentClicks,
    });
  } catch {
    return NextResponse.json(
      {
        linkType: 'whatsapp_group',
        days: 30,
        totalClicks: 0,
        allTimeTotal: 0,
        bySource: [],
        recentClicks: [],
        error: 'Database not available — use Vercel Analytics for production stats.',
      },
      { status: 200 }
    );
  }
}
