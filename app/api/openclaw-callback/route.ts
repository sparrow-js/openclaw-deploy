import { broadcast } from '@/utils/broadcast';
import { db } from '@/db';
import { openclaw } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface RequestBody {
  clientId: string;
  status: string;
  url?: string;
  event: string;
  // Additional fields for various events
  app_name?: string;
  app_url?: string;
  docker_image?: string;
  machine_count?: number;
  volume_name?: string;
  gateway_token?: string;
  error?: string;
  timestamp: string;
}

// 判断部署事件是否为最终成功事件
function isFinalSuccessEvent(event: string, status: string): boolean {
  // deploy_openclaw 或 scale_fly_app 成功意味着部署完成
  return (event === 'deploy_openclaw' || event === 'scale_fly_app') &&
    (status === 'completed' || status === 'success' || status === 'scaled' || status === 'deployed');
}

// 判断是否为错误状态
function isErrorStatus(status: string): boolean {
  return status === 'error' || status === 'failed' || status === 'failure';
}

export async function POST(req: Request) {
  const data = (await req.json()) as RequestBody;
  const { clientId, status, url, event, ...additionalData } = data;

  if (!clientId || !status) {
    return new Response(JSON.stringify({ error: `Missing clientId ${clientId} or status ${status}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Strip "app-" prefix from clientId for database operations if it exists
  const dbClientId = clientId.startsWith('app-') ? clientId.substring(4) : clientId;

  console.log('clientId', clientId);

  try {
    // Send real-time update via Supabase broadcast
    const result = await broadcast(clientId, 'openclaw', {
      status,
      appId: clientId,
      url: url || additionalData.app_url,
      event,
      ...additionalData,
    });


    const deployUrl = url || additionalData.app_url;
    const timestamp = additionalData.timestamp || new Date().toISOString();

    // 确定 openclaw 记录的总体部署状态
    let overallStatus: 'pending' | 'deploying' | 'running' | 'stopped' | 'error' | 'deleted' | undefined;
    if (isFinalSuccessEvent(event, status)) {
      overallStatus = 'running';
    } else if (isErrorStatus(status)) {
      overallStatus = 'error';
    }

    // 更新 openclaw 表（而不是 deploy 表）
    await db.update(openclaw)
      .set({
        machineStatus: `${event}: ${status}`,
        lastEvent: event,
        lastEventTimestamp: timestamp,
        ...(overallStatus ? { status: overallStatus } : {}),
        ...(deployUrl ? { flyAppUrl: deployUrl } : {}),
        ...(additionalData.gateway_token ? { gatewayToken: additionalData.gateway_token } : {}),
        ...(isErrorStatus(status) ? { errorMessage: additionalData.error || `${event} failed: ${status}` } : {}),
        ...(overallStatus === 'running' ? { errorMessage: null } : {}),
        metadata: {
          ...additionalData,
          lastEvent: event,
          lastEventTimestamp: timestamp,
        },
        updatedAt: new Date(),
      })
      .where(eq(openclaw.clientId, dbClientId));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('OpenClaw callback failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to process openclaw callback' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
