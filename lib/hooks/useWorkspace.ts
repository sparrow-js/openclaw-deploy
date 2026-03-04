'use client';

import { useStore } from '@nanostores/react';
import { useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { workspaceStore } from '@/lib/stores/workspace';

/**
 * 提供当前用户 ID（兼容原 getCurrentWorkspaceId 调用处）。
 * 不再有 workspace 列表，getCurrentWorkspaceId() 即 session.user.id。
 */
export function useWorkspace() {
  const { data: session, status } = useSession();
  const currentUserId = useStore(workspaceStore.currentUserId);

  useEffect(() => {
    workspaceStore.setUserId(session?.user?.id ?? null);
  }, [session?.user?.id]);

  const getCurrentWorkspaceId = useCallback(() => {
    return session?.user?.id ?? workspaceStore.getCurrentWorkspaceId() ?? null;
  }, [session?.user?.id]);

  const reset = useCallback(() => {
    workspaceStore.reset();
  }, []);

  return {
    getCurrentWorkspaceId,
    currentUserId: currentUserId ?? session?.user?.id ?? null,
    loading: status === 'loading',
    reset,
  };
}
