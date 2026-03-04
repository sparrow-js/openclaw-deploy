import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMachine, executeCommand } from '@/utils/machines';

export const dynamic = 'force-dynamic';

// 通过 Fly.io Machines API 在容器内执行 CLI 来 approve/reject 设备
export async function POST(
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
    const { action, requestId } = body;

    if (!action || !requestId) {
      return NextResponse.json({ error: 'Missing action or requestId' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'No Fly app configured' }, { status: 400 });
    }

    // 获取活跃的机器
    const machines = await getMachine(flyAppName);
    if (!machines || machines.length === 0) {
      return NextResponse.json({ error: 'No active machines found' }, { status: 503 });
    }

    const machine = machines[0];
    console.log(`[devices/action] ${action} request ${requestId} on machine ${machine.id}`);

    // 在容器内执行 CLI 命令
    // OpenClaw CLI: node dist/index.js devices approve <requestId>
    //              node dist/index.js devices reject <requestId>
    const safeRequestId = requestId.replace(/[^a-zA-Z0-9-]/g, '');
    const result = await executeCommand(flyAppName, machine.id, [
      'sh', '-c',
      `cd /app && OPENCLAW_GATEWAY_PORT=3000 node /app/dist/index.js devices ${action} ${safeRequestId} 2>&1`
    ]);

    console.log(`[devices/action] CLI exit_code: ${result.exit_code}`);
    if (result.stdout) {
      console.log(`[devices/action] stdout: ${result.stdout.substring(0, 300)}`);
    }
    if (result.stderr) {
      console.log(`[devices/action] stderr: ${result.stderr.substring(0, 200)}`);
    }

    if (result.exit_code === 0) {
      return NextResponse.json({
        success: true,
        message: `Device ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        output: result.stdout,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `CLI command failed: ${result.stderr || result.stdout || 'Unknown error'}`,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[devices/action] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

