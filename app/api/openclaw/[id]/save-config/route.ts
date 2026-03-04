import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMachine, executeCommand, restartMachine } from '@/utils/machines';
import { gzip } from 'pako';

function arrayBufferToBase64(buffer: Uint8Array): string {
  return Buffer.from(buffer).toString('base64');
}

/** 在现有 openclawConfig 上合并新 model，用于写入 Fly /data/openclaw.json */
function buildOpenclawConfigForFly(
  existingConfig: Record<string, any> | null,
  model: string
): Record<string, any> {
  const existing = existingConfig || {};
  return {
    ...existing,
    gateway: {
      mode: 'local',
      controlUi: {
        dangerouslyAllowHostHeaderOriginFallback: true,
      },
    },
    agents: {
      ...existing.agents,
      defaults: {
        ...(existing.agents?.defaults || {}),
        model: {
          primary: model,
          fallbacks: [model],
        },
      },
    },
    meta: {
      ...existing.meta,
      lastTouchedVersion: '2026.2.23',
    },
  };
}

/**
 * 保存配置：更新 DB 中的 model 与 openclawConfig，将 openclaw.json 写入 Fly 机器 /data，并重启机器。
 * Body: { model: string }
 */
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
    const { model } = body;

    if (!model || typeof model !== 'string') {
      return NextResponse.json({ error: 'model is required' }, { status: 400 });
    }

    const records = await db
      .select()
      .from(openclaw)
      .where(and(eq(openclaw.id, id), eq(openclaw.userId, userId)))
      .limit(1);

    if (!records.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const record = records[0];
    const flyAppName = record.flyAppName;

    if (!flyAppName) {
      return NextResponse.json({ error: 'No Fly app configured for this instance' }, { status: 400 });
    }

    const openclawConfigForFly = buildOpenclawConfigForFly(record.openclawConfig, model);
    const configJson = JSON.stringify(openclawConfigForFly, null, 2);

    // 1. 更新数据库：model + openclawConfig
    const [updated] = await db
      .update(openclaw)
      .set({
        model,
        openclawConfig: openclawConfigForFly,
        updatedAt: new Date(),
      })
      .where(and(eq(openclaw.id, id), eq(openclaw.userId, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
    }

    // 2. 获取 Fly 机器
    const appName = flyAppName.replace(/^app-/, '');
    const machines = await getMachine(appName);
    if (!machines || machines.length === 0) {
      return NextResponse.json(
        { error: 'No active machines found for this app' },
        { status: 503 }
      );
    }
    const machine = machines[0];

    // 3. 写入 /data/openclaw.json：mkdir -p /data，然后写入 gzip+base64 内容
    const contentBuffer = new TextEncoder().encode(configJson);
    const compressed = gzip(contentBuffer);
    const base64Content = arrayBufferToBase64(compressed);

    const safeBase64 = base64Content.replace(/'/g, "'\\''");
    const mkdirAndWrite = [
      'sh',
      '-c',
      `mkdir -p /data && echo '${safeBase64}' | base64 -d | gunzip > /data/openclaw.json`,
    ];

    const writeResult = await executeCommand(appName, machine.id, mkdirAndWrite);
    if (writeResult.exit_code !== 0) {
      console.error('[save-config] write openclaw.json failed:', writeResult.stderr || writeResult.stdout);
      return NextResponse.json(
        { error: 'Failed to write config to Fly machine', detail: writeResult.stderr || writeResult.stdout },
        { status: 502 }
      );
    }

    // 4. 重启机器（Fly 无 restart 端点，用 stop + start 实现）
    await restartMachine(appName, machine.id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in save-config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
