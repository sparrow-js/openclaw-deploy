import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMachine, executeCommand } from '@/utils/machines';

const CLAWHUB_TOKEN = process.env.CLAWHUB_TOKEN;

export const dynamic = 'force-dynamic';

// 通过 Fly.io Machines API 在容器内执行 CLI 安装 skill
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
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
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
    console.log(`[skills/install] Installing skill "${slug}" on machine ${machine.id}`);

    // 在容器内执行 clawhub install <slug> 安装 skill
    const safeSlug = slug.replace(/[^a-zA-Z0-9_@/.-]/g, '');
    const result = await executeCommand(flyAppName, machine.id, [
      'sh', '-c',
      `CLAWHUB_TOKEN=${CLAWHUB_TOKEN} clawhub install ${safeSlug} 2>&1`
    ]);

    console.log(`[skills/install] CLI exit_code: ${result.exit_code}`);
    if (result.stdout) {
      console.log(`[skills/install] stdout: ${result.stdout.substring(0, 500)}`);
    }
    if (result.stderr) {
      console.log(`[skills/install] stderr: ${result.stderr.substring(0, 200)}`);
    }

    if (result.exit_code === 0) {
      return NextResponse.json({
        success: true,
        message: `Skill "${slug}" installed successfully`,
        output: result.stdout,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `CLI command failed: ${result.stderr || result.stdout || 'Unknown error'}`,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[skills/install] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

