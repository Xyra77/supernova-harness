/** Dependency-free IPC names shared with the sandboxed mandatory-update preload. */
export const MANDATORY_IPC = {
  status: 'snh-desktop:mandatory-status', state: 'snh-desktop:mandatory-state', action: 'snh-desktop:mandatory-action',
} as const
