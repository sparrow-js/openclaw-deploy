import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMachine, executeCommand } from '@/utils/machines';

export const dynamic = 'force-dynamic';

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
    const { action, code } = body;

    if (!action || !code) {
      return NextResponse.json({ error: 'Missing action or code' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

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

    const machines = await getMachine(flyAppName);
    if (!machines || machines.length === 0) {
      return NextResponse.json({ error: 'No active machines found' }, { status: 503 });
    }

    const machine = machines[0];
    const safeCode = code.replace(/[^a-zA-Z0-9]/g, '');
    console.log(`[pairing/action] ${action} code ${safeCode} on machine ${machine.id}`);

    const result = await executeCommand(flyAppName, machine.id, [
      'sh', '-c',
      `cd /app && OPENCLAW_GATEWAY_PORT=3000 node /app/dist/index.js pairing ${action} feishu ${safeCode} 2>&1`
    ]);

    let stdout = result.stdout || '';
    let stderr = result.stderr || '';
    if (stdout && !stdout.includes('\n') && !stdout.includes(' ')) {
      try {
        const decoded = Buffer.from(stdout, 'base64').toString('utf-8');
        if (decoded && !decoded.includes('\ufffd')) stdout = decoded;
      } catch { /* not base64 */ }
    }
    if (stderr && !stderr.includes('\n') && !stderr.includes(' ')) {
      try {
        const decoded = Buffer.from(stderr, 'base64').toString('utf-8');
        if (decoded && !decoded.includes('\ufffd')) stderr = decoded;
      } catch { /* not base64 */ }
    }

    console.log(`[pairing/action] CLI exit_code: ${result.exit_code}`);
    if (stdout) console.log(`[pairing/action] stdout: ${stdout.substring(0, 300)}`);
    if (stderr) console.log(`[pairing/action] stderr: ${stderr.substring(0, 200)}`);

    const exitCode = result.exit_code ?? (result as any).exitCode ?? -1;
    if (exitCode === 0) {
      return NextResponse.json({
        success: true,
        message: `Pairing ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        output: stdout,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `CLI command failed: ${stderr || stdout || 'Unknown error'}`,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[pairing/action] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
