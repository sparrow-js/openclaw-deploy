import { NextResponse } from 'next/server';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { auth } from 'auth';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  try {
    const result = await db
      .select({
        id: openclaw.id,
        userId: openclaw.userId,
        description: openclaw.name,
        timestamp: openclaw.createdAt,
        metadata: openclaw.metadata,
        status: openclaw.status,
      })
      .from(openclaw)
      .where(eq(openclaw.userId, session.user!.id))
      .orderBy(desc(openclaw.createdAt))
      .limit(50);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
