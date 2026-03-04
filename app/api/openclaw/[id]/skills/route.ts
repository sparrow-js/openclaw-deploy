import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMachine, executeCommand } from '@/utils/machines';

// 安装 skill 的功能已移至 /api/openclaw/[id]/skills/install/route.ts

export const dynamic = 'force-dynamic';

// 从部署的 OpenClaw 应用获取已安装的 skills 列表
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

    // 获取记录以确认所有权并获取 flyAppName
    const record = await db
      .select()
      .from(openclaw)
      .where(and(eq(openclaw.id, id), eq(openclaw.userId, userId)))
      .limit(1);

    if (!record.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { flyAppName } = record[0];
    if (!flyAppName) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 通过 Fly Machines API 在容器内执行 CLI 获取已安装的 skills
    try {
      const machines = await getMachine(flyAppName);
      if (!machines || machines.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }

      const machine = machines[0];
      const result = await executeCommand(flyAppName, machine.id, [
        'sh', '-c',
        `cd /app && OPENCLAW_GATEWAY_PORT=3000 node /app/dist/index.js skills list --json 2>&1`
      ]);

      if (result.exit_code === 0 && result.stdout) {
        try {
          const data = JSON.parse(result.stdout);
          return NextResponse.json({ success: true, data: data.skills || data.data || data.items || data || [] });
        } catch {
          // JSON 解析失败，返回空
          return NextResponse.json({ success: true, data: [] });
        }
      }
    } catch {
      // CLI 执行失败，静默返回空列表
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching installed skills:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


