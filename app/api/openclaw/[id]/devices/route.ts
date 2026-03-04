import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMachine, executeCommand } from '@/utils/machines';

// 禁用 Next.js 路由缓存，每次都从容器实时获取
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PendingDevice {
  request: string;
  device: string;
  role: string;
  ip: string;
  age: string;
  flags: string;
}

interface PairedDevice {
  device: string;
  roles: string;
  scopes: string;
  tokens: string;
  ip: string;
}

/**
 * 解析 OpenClaw CLI `devices list` 的 Unicode 表格输出
 * 
 * 实际格式:
 * Pending (1)
 * ┌──────────┬──────────┬──────────┬────────┬────────┬────────┐
 * │ Request  │ Device   │ Role     │ IP     │ Age    │ Flags  │
 * ├──────────┼──────────┼──────────┼────────┼────────┼────────┤
 * │ uuid     │ hash...  │ operator │        │ 3m ago │        │
 * │          │ ...rest  │          │        │        │        │
 * └──────────┴──────────┴──────────┴────────┴────────┴────────┘
 * Paired (2)
 * ┌──────────┬──────────┬──────────┬──────────┬────────┐
 * │ Device   │ Roles    │ Scopes   │ Tokens   │ IP     │
 * ...
 */

/** 从 Unicode 表格中提取数据行 */
function parseBoxTable(lines: string[]): string[][] {
  const rows: string[][] = [];
  
  for (const line of lines) {
    // 跳过边框行（包含 ┌┬┐├┼┤└┴┘─）
    if (/^[┌┬┐├┼┤└┴┘─\s]+$/.test(line)) continue;
    // 只处理含 │ 的数据行
    if (!line.includes('│')) continue;
    // 按 │ 分割，去掉首尾空元素
    const cells = line.split('│').map(c => c.trim());
    // 去掉第一个和最后一个空字符串（表格边框产生的）
    if (cells.length > 2) {
      rows.push(cells.slice(1, -1));
    }
  }
  return rows;
}

function parseDevicesOutput(output: string): { pending: PendingDevice[]; paired: PairedDevice[] } {
  const pending: PendingDevice[] = [];
  const paired: PairedDevice[] = [];

  const lines = output.split('\n');

  // 找到各段落的起始行
  let section: 'none' | 'pending' | 'paired' = 'none';
  let currentTableLines: string[] = [];

  const flushTable = () => {
    if (currentTableLines.length === 0) return;
    const rows = parseBoxTable(currentTableLines);
    // 第一行是表头，跳过
    const dataRows = rows.slice(1);

    if (section === 'pending') {
      // 处理多行单元格：如果 Request 列为空，说明是上一行的延续
      let currentRow: PendingDevice | null = null;
      for (const cells of dataRows) {
        const request = cells[0]?.trim() || '';
        const devicePart = cells[1]?.trim() || '';
        const role = cells[2]?.trim() || '';
        const ip = cells[3]?.trim() || '';
        const age = cells[4]?.trim() || '';
        const flags = cells[5]?.trim() || '';

        if (request) {
          // 新设备行
          currentRow = { request, device: devicePart, role, ip, age, flags };
          pending.push(currentRow);
        } else if (currentRow && devicePart) {
          // 续行 — 拼接 device hash
          currentRow.device += devicePart;
        }
      }
    } else if (section === 'paired') {
      let currentRow: PairedDevice | null = null;
      for (const cells of dataRows) {
        const devicePart = cells[0]?.trim() || '';
        const roles = cells[1]?.trim() || '';
        const scopes = cells[2]?.trim() || '';
        const tokens = cells[3]?.trim() || '';
        const ip = cells[4]?.trim() || '';

        // 判断是否为新行：如果 roles/scopes/tokens/ip 至少有一个非空，或者是第一行
        if (roles || scopes || tokens || ip || !currentRow) {
          currentRow = { device: devicePart, roles, scopes, tokens, ip };
          if (devicePart) {
            paired.push(currentRow);
          }
        } else if (currentRow && devicePart) {
          // 续行 — 拼接 device hash
          currentRow.device += devicePart;
        }
      }
    }
    currentTableLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // 检测段落标题: "Pending (N)" 或 "Paired (N)"
    if (/^pending\s*(\(\d+\))?$/i.test(trimmed)) {
      flushTable();
      section = 'pending';
      continue;
    }
    if (/^paired\s*(\(\d+\))?$/i.test(trimmed)) {
      flushTable();
      section = 'paired';
      continue;
    }

    // 收集当前段落的表格行
    if (section !== 'none' && trimmed.length > 0) {
      currentTableLines.push(trimmed);
    }
  }
  // 处理最后一个段落
  flushTable();

  return { pending, paired };
}

// 通过 Fly.io Machines API 在容器内执行 CLI 获取设备列表
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
      console.log('[devices] No flyAppName for record', id);
      return NextResponse.json({ success: true, pending: [], paired: [] });
    }

    try {
      // 1. 获取活跃的机器
      const machines = await getMachine(flyAppName);
      if (!machines || machines.length === 0) {
        console.log('[devices] No active machines for', flyAppName);
        return NextResponse.json({ success: true, pending: [], paired: [] });
      }

      const machine = machines[0];
      console.log(`[devices] Using machine ${machine.id} (state: ${machine.state}) for ${flyAppName}`);

      // 2. 在容器内执行 CLI 命令获取设备列表
      const result = await executeCommand(flyAppName, machine.id, [
        'sh', '-c',
        'cd /app && OPENCLAW_GATEWAY_PORT=3000 node /app/dist/index.js devices list 2>&1'
      ]);

      // 打印完整的 exec 响应，方便调试
      console.log('[devices] Exec raw result:', JSON.stringify(result).substring(0, 1000));

      const exitCode = result.exit_code ?? result.exitCode ?? -1;
      // stdout 可能是 base64 编码的
      let stdout = result.stdout || '';
      let stderr = result.stderr || '';

      // 尝试 base64 解码（Fly exec API 有时返回 base64）
      if (stdout && !stdout.includes('\n') && !stdout.includes(' ')) {
        try {
          const decoded = Buffer.from(stdout, 'base64').toString('utf-8');
          // 如果解码后是可读文本，就使用解码后的
          if (decoded && !decoded.includes('\ufffd')) {
            stdout = decoded;
          }
        } catch {
          // 不是 base64，保持原样
        }
      }
      if (stderr && !stderr.includes('\n') && !stderr.includes(' ')) {
        try {
          const decoded = Buffer.from(stderr, 'base64').toString('utf-8');
          if (decoded && !decoded.includes('\ufffd')) {
            stderr = decoded;
          }
        } catch {
          // 不是 base64，保持原样
        }
      }

      console.log(`[devices] CLI exit_code: ${exitCode}`);
      console.log('[devices] CLI stdout:', stdout.substring(0, 800));
      if (stderr) {
        console.log('[devices] CLI stderr:', stderr.substring(0, 400));
      }

      if (exitCode !== 0) {
        console.error('[devices] CLI command failed with exit code:', exitCode);
        // 即便失败也尝试解析，有时 exit_code=1 但 stdout 仍有有效输出
      }

      // 3. 解析 CLI 表格输出（合并 stdout + stderr，因为 2>&1 会混在一起）
      const combinedOutput = stdout || stderr || '';
      const { pending, paired } = parseDevicesOutput(combinedOutput);
      console.log(`[devices] Parsed - pending: ${pending.length}, paired: ${paired.length}`);

      return NextResponse.json({
        success: true,
        pending,
        paired,
      });
    } catch (execErr) {
      console.error('[devices] Exec error:', execErr);
      return NextResponse.json({ success: true, pending: [], paired: [] });
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
