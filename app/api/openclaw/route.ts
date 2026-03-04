import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await db
      .select()
      .from(openclaw)
      .where(eq(openclaw.userId, userId))
      .orderBy(desc(openclaw.createdAt));

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching openclaw records:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

