import { atom, type WritableAtom } from 'nanostores';

/**
 * 简化版：仅保存当前用户 ID（由 useWorkspace 在客户端从 session 写入）。
 * 不再有 workspace 列表与切换逻辑。
 */
export class WorkspaceStore {
  currentUserId: WritableAtom<string | null> = atom<string | null>(null);

  setUserId(userId: string | null): void {
    this.currentUserId.set(userId);
  }

  getCurrentWorkspaceId(): string | null {
    return this.currentUserId.get();
  }

  reset(): void {
    this.currentUserId.set(null);
  }
}

export const workspaceStore = new WorkspaceStore();
