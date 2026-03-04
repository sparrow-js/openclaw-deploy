import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteFlyApp } from '@/utils/machines';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const record = await db
      .select()
      .from(openclaw)
      .where(and(eq(openclaw.id, id), eq(openclaw.userId, userId)))
      .limit(1);

    if (!record.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: record[0] });
  } catch (error) {
    console.error('Error fetching openclaw record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 更新 openclaw 记录（如模型切换等）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(openclaw)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(eq(openclaw.id, id), eq(openclaw.userId, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating openclaw record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 删除 openclaw 记录及 Fly.io 应用
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 获取记录以确认所有权
    const record = await db
      .select()
      .from(openclaw)
      .where(and(eq(openclaw.id, id), eq(openclaw.userId, userId)))
      .limit(1);

    if (!record.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { flyAppName } = record[0];

    // 1. 删除 Fly.io 应用（即使失败也继续删除数据库记录）
    if (flyAppName) {
      try {
        console.log(`[delete] Deleting Fly app: ${flyAppName}`);
        await deleteFlyApp(flyAppName);
        console.log(`[delete] Fly app ${flyAppName} deleted successfully`);
      } catch (flyErr) {
        console.error(`[delete] Failed to delete Fly app ${flyAppName}:`, flyErr);
        // 不阻止数据库记录删除
      }
    }

    // 2. 删除数据库记录
    await db
      .delete(openclaw)
      .where(and(eq(openclaw.id, id), eq(openclaw.userId, userId)));

    console.log(`[delete] Database record ${id} deleted`);

    return NextResponse.json({ success: true, message: 'Deployment deleted successfully' });
  } catch (error) {
    console.error('Error deleting openclaw record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
