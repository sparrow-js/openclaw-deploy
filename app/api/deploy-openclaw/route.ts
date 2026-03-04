import { NextResponse } from 'next/server';
import { deployOpenClaw } from '@/lib/deploy';
import { UNLIMITED_DEPLOY_EMAILS } from '@/lib/deploy/config';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclaw, openclawCredits } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const {
      flyAppName,
      dockerImage,
      primaryRegion,
      volumeName,
      clientId,
      instanceName,
      openclawConfig,
      openrouterApiKey,
    } = body;

    
    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // 检查用户是否已有部署（非 deleted 状态），豁免邮箱不受限制
    const userEmail = session?.user?.email;
    if (!UNLIMITED_DEPLOY_EMAILS.includes(userEmail || '')) {
      const [existingDeploy] = await db
        .select({ id: openclaw.id })
        .from(openclaw)
        .where(and(eq(openclaw.userId, userId), ne(openclaw.status, 'deleted')))
        .limit(1);

      if (existingDeploy) {
        return NextResponse.json(
          { error: 'You already have an active deployment. Each user is limited to one deployment.' },
          { status: 403 }
        );
      }
    }

    // 从 openclawCredits 表中获取用户自己的 OpenRouter API Key
    const [userCredits] = await db
      .select({ openrouterApiKey: openclawCredits.openrouterApiKey })
      .from(openclawCredits)
      .where(eq(openclawCredits.userId, userId))
      .limit(1);

    const userApiKey = openrouterApiKey || userCredits?.openrouterApiKey;

    if (!userApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API Key is required. Please set up your API key first.' },
        { status: 400 }
      );
    }

    const appName = flyAppName || clientId;
    const appUrl = `https://${appName}.fly.dev`;
    const region = primaryRegion || 'sin';

    // 从 openclawConfig 中提取 model 和 channel 信息
    const model = openclawConfig?.agents?.defaults?.model?.primary || null;
    const channel = openclawConfig?.bindings?.[0]?.match?.channel || null;
    const channelCredentials = openclawConfig?.channels?.[channel] || null;

    // 将部署记录写入数据库
    const [record] = await db
      .insert(openclaw)
      .values({
        userId,
        clientId,
        name: instanceName || null,
        flyAppName: appName,
        flyAppUrl: appUrl,
        dockerImage: dockerImage || null,
        region,
        volumeName: volumeName || null,
        status: 'pending',
        model,
        channel,
        openclawConfig: openclawConfig || null,
        channelCredentials,
      })
      .returning();

    // 触发 GitHub Actions workflow（使用用户自己的 API Key）
    const result = await deployOpenClaw({
      flyAppName: appName,
      dockerImage,
      primaryRegion: region,
      volumeName,
      clientId,
      openclawConfig,
      openrouterApiKey: userApiKey,
    });

    if (result.error) {
      // 部署触发失败，更新数据库状态为 error
      await db
        .update(openclaw)
        .set({
          status: 'error',
          errorMessage: result.error,
          updatedAt: new Date(),
        })
        .where(eq(openclaw.id, record.id));

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // 部署触发成功，更新状态为 deploying
    await db
      .update(openclaw)
      .set({
        status: 'deploying',
        lastEvent: 'workflow_triggered',
        lastEventTimestamp: new Date().toISOString(),
        updatedAt: new Date(),
      })
      .where(eq(openclaw.id, record.id));

    return NextResponse.json({
      success: true,
      flyAppName: appName,
      url: appUrl,
      recordId: record.id,
      hasOwnApiKey: !!openrouterApiKey,
      message: 'OpenClaw deployment workflow triggered successfully',
    });
  } catch (error) {
    console.error('Error deploying OpenClaw:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
