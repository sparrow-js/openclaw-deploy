import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMachine, executeCommand } from '@/utils/machines';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface PairingRequest {
  code: string;
  feishuUserId: string;
  meta: string;
  requested: string;
}

function parseBoxTable(lines: string[]): string[][] {
  const rows: string[][] = [];
  for (const line of lines) {
    if (/^[┌┬┐├┼┤└┴┘─\s]+$/.test(line)) continue;
    if (!line.includes('│')) continue;
    const cells = line.split('│').map(c => c.trim());
    if (cells.length > 2) {
      rows.push(cells.slice(1, -1));
    }
  }
  return rows;
}

function parsePairingOutput(output: string): PairingRequest[] {
  const requests: PairingRequest[] = [];
  const lines = output.split('\n');

  let inTable = false;
  const tableLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^pairing requests?\s*\(\d+\)/i.test(trimmed)) {
      inTable = true;
      continue;
    }
    if (inTable && trimmed.length > 0) {
      tableLines.push(trimmed);
    }
  }

  const rows = parseBoxTable(tableLines);
  const dataRows = rows.slice(1);

  for (const cells of dataRows) {
    const code = cells[0]?.trim() || '';
    const feishuUserId = cells[1]?.trim() || '';
    const meta = cells[2]?.trim() || '';
    const requested = cells[3]?.trim() || '';

    if (code) {
      requests.push({ code, feishuUserId, meta, requested });
    }
  }

  return requests;
}

function decodeStdio(raw: string): string {
  if (!raw) return '';
  if (!raw.includes('\n') && !raw.includes(' ')) {
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf-8');
      if (decoded && !decoded.includes('\ufffd')) return decoded;
    } catch { /* not base64 */ }
  }
  return raw;
}

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

    const { flyAppName } = record[0];
    if (!flyAppName) {
      return NextResponse.json({ success: true, requests: [] });
    }

    try {
      const machines = await getMachine(flyAppName);
      if (!machines || machines.length === 0) {
        return NextResponse.json({ success: true, requests: [] });
      }

      const machine = machines[0];
      console.log(`[pairing] Using machine ${machine.id} for ${flyAppName}`);

      const result = await executeCommand(flyAppName, machine.id, [
        'sh', '-c',
        'cd /app && OPENCLAW_GATEWAY_PORT=3000 node /app/dist/index.js pairing list feishu 2>&1'
      ]);

      const stdout = decodeStdio(result.stdout || '');
      const stderr = decodeStdio(result.stderr || '');
      const combinedOutput = stdout || stderr || '';

      console.log(`[pairing] CLI exit_code: ${result.exit_code ?? result.exitCode}`);
      console.log('[pairing] CLI output:', combinedOutput.substring(0, 800));

      const requests = parsePairingOutput(combinedOutput);
      console.log(`[pairing] Parsed ${requests.length} pairing requests`);

      return NextResponse.json({ success: true, requests });
    } catch (execErr) {
      console.error('[pairing] Exec error:', execErr);
      return NextResponse.json({ success: true, requests: [] });
    }
  } catch (error) {
    console.error('Error fetching pairing requests:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
