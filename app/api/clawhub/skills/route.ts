import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/auth';

const CLAWHUB_BASE = 'https://clawhub.ai/api/v1';
const CLAWHUB_TOKEN = process.env.CLAWHUB_TOKEN;

// 代理 ClawHub API 获取 skills 列表（支持搜索）
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '50';
    const cursor = searchParams.get('cursor') || '';

    let url: URL;

    if (query.trim()) {
      // 使用搜索 API
      url = new URL(`${CLAWHUB_BASE}/search`);
      url.searchParams.set('q', query.trim());
      url.searchParams.set('limit', limit);
    } else {
      // 使用列表 API
      url = new URL(`${CLAWHUB_BASE}/skills`);
      url.searchParams.set('limit', limit);
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${CLAWHUB_TOKEN}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `ClawHub API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // 搜索接口返回 { results: [...] }，列表接口返回 { items: [...], nextCursor }
    if (query.trim()) {
      // 搜索结果格式: { score, slug, displayName, summary, version, updatedAt }
      const results = (data.results || []).map((r: any) => ({
        slug: r.slug,
        displayName: r.displayName,
        summary: r.summary,
        tags: {},
        stats: { comments: 0, downloads: 0, installsAllTime: 0, installsCurrent: 0, stars: 0, versions: 1 },
        createdAt: r.updatedAt,
        updatedAt: r.updatedAt,
        latestVersion: { version: r.version || '1.0.0', createdAt: r.updatedAt, changelog: '' },
        _score: r.score,
      }));
      return NextResponse.json({ success: true, data: results, nextCursor: null });
    } else {
      return NextResponse.json({ success: true, data: data.items || [], nextCursor: data.nextCursor || null });
    }
  } catch (error) {
    console.error('Error fetching ClawHub skills:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
