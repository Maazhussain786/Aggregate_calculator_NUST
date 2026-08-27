import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const VALID_LINK_TYPES = ['whatsapp_group', 'whatsapp_enroll', 'whatsapp_sample'];
const VALID_SOURCES = ['homepage', 'preparation', 'horizon_promo'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkType, source } = body;

    if (!linkType || !source) {
      return NextResponse.json(
        { error: 'linkType and source are required' },
        { status: 400 }
      );
    }

    if (!VALID_LINK_TYPES.includes(linkType)) {
      return NextResponse.json(
        { error: `Invalid linkType. Must be one of: ${VALID_LINK_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_SOURCES.includes(source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${VALID_SOURCES.join(', ')}` },
        { status: 400 }
      );
    }

    await prisma.linkClick.create({
      data: { linkType, source },
    });

    return NextResponse.json({ success: true });
  } catch {
    // If database is not available (e.g., Vercel with SQLite), silently succeed
    // The Vercel Analytics tracking will still work
    return NextResponse.json({ success: true });
  }
}
