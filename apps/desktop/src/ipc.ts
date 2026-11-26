import type { DesktopFileActions } from '@supernova-ai/snh-client-ui-file-actions/types'
/** Typed preload operations exposed only by the Electron shell. */

export type { DesktopChannelState, DesktopChannelChangeResult } from '@supernova-ai/snh-client-ui-settings-general/types'
import type { DesktopChannelBridge, DesktopChannelState } from '@supernova-ai/snh-client-ui-settings-general/types'
import type { DesktopKeyboardApi, DesktopShortcutsApi } from '@supernova-ai/snh-client-shortcuts/protocol'
import type { IpcMainInvokeEvent } from 'electron'
import type { DesktopBrowserBridge } from '@supernova-ai/snh-client-ui-sidebar-browser/types'
import type { DesktopFileDrag } from '@supernova-ai/snh-util-file-drag'

/** IPC channel names kept private to the desktop application bundle. */
export const DESKTOP_IPC = {
  fileSave: 'snh-desktop:file-save',
  clipboardImageRead: 'snh-desktop:clipboard-image-read',
  shortcutsInput: 'snh-desktop:shortcuts-input',
  shortcutsCloseWindow: 'snh-desktop:shortcuts-close-window',
  shortcutsGet: 'snh-desktop:shortcuts-get',
  shortcutsEdit: 'snh-desktop:shortcuts-edit',
  shortcutsChanged: 'snh-desktop:shortcuts-changed',
  shortcutsRecording: 'snh-desktop:shortcuts-recording',
  boot: 'snh-desktop:boot',
  enterWorkspace: 'snh-desktop:enter-workspace',
  onboardingActive: 'snh-desktop:onboarding-active',
  onboardingApiKey: 'snh-desktop:onboarding-api-key',
  bootFailed: 'snh-desktop:boot-failed',
  browserAcquire: 'snh-desktop:browser-acquire',
  browserRelease: 'snh-desktop:browser-release',
  browserOpenRequested: 'snh-desktop:browser-open-requested',
  directoryPick: 'snh-desktop:directory-pick',
  fileDragPrepare: 'snh-desktop:file-drag-prepare',
  fileDragCancel: 'snh-desktop:file-drag-cancel',
  fileDragStart: 'snh-desktop:file-drag-start',
  fileDragRelease: 'snh-desktop:file-drag-release',
  deviceInfo: 'snh-desktop:device-info',
  localeBootstrap: 'snh-desktop:locale-bootstrap',
  localeChanged: 'snh-desktop:locale-changed',
  updatesChannelGet: 'snh-desktop:updates-channel-get',
  updatesChannelSet: 'snh-desktop:updates-channel-set',
  updatesChannelChanged: 'snh-desktop:updates-channel-changed',
  updatesStatus: 'snh-desktop:updates-status',
  updatesOpen: 'snh-desktop:updates-open',
  updatesPresentation: 'snh-desktop:updates-presentation',
  nativeThemeSet: 'snh-desktop:native-theme-set',
  windowFullscreen: 'snh-desktop:window-fullscreen',
  windowsAppearance: 'snh-desktop:windows-appearance',
  windowsMenu: 'snh-desktop:windows-menu',
} as const

/** Desktop release update state rendered by desktop-owned UI. */
export type DesktopUpdatePreparationFailureKind = 'stop-failed' | 'tasks-changed' | 'tasks-unavailable' | 'fullscreen-timeout'

export interface DesktopUpdateState {
  readonly phase: 'idle' | 'checking' | 'available' | 'downloading' | 'verifying' | 'installing' | 'ready' | 'error'
  readonly version?: string
  readonly message?: string
  /** Main-owned diagnostics without subprocess output or credentials; hidden until expanded. */
  readonly technicalDetails?: string
  readonly percent?: number
  readonly failedOperation?: 'check' | 'download' | 'install' | 'configuration'
  /** Main-owned preparation cause; UI wording is selected by the active locale. */
  readonly preparationFailure?: DesktopUpdatePreparationFailureKind
  /** Current filesystem failure, independent of previous cache cleanup attempts. */
  readonly downloadFailure?: 'space' | 'permission' | 'busy'
}

/** Classified failure copy selected by the Web locale without exposing raw updater diagnostics. */
export type DesktopUpdateFailureKind =
  | 'configuration'
  | 'check'
  | 'check-network'
  | 'download'
  | 'download-network'
  | 'download-space'
  | 'download-permission'
  | 'download-busy'
  | 'install'
  | 'install-network'
  | 'stop-failed'
  | 'tasks-changed'
  | 'tasks-unavailable'
  | 'fullscreen-timeout'

/** Semantic status content; actions open main-process confirmation dialogs only. */
export interface DesktopUpdatePresentation {
  readonly phase: DesktopUpdateState['phase']
  readonly version?: string
  readonly percent?: number
  readonly failure?: DesktopUpdateFailureKind
  readonly configurationError?: DesktopChannelState['error']
}

/** Product documents cannot supply update versions, package URLs, or installation authorization. */
export interface SnhDesktopProductApi {
  readonly fileActions: DesktopFileActions
  readonly protocolVersion: 1
  readonly browser: DesktopBrowserBridge
  readonly fileDrag: DesktopFileDrag
  readonly keyboard: DesktopKeyboardApi
  readonly shortcuts: DesktopShortcutsApi
  /**
   * Local machine description for the feedback questionnaire.
   * @returns `name=value` fields separated by `; `, with no hostname, user name, or serial number.
   */
  deviceInfo(): Promise<string>
  readonly updates: {
    readonly channels: DesktopChannelBridge
    status(): Promise<DesktopUpdatePresentation>
    open(): Promise<void>
    subscribe(listener: (state: DesktopUpdatePresentation) => void): () => void
  }
}

/** Scheme of Desktop-owned application documents. */
export const SCHEME = 'snh-app'

/**
 * Reject IPC outside the allowed Desktop document origins.
 * @param event - IPC caller whose frame URL supplies the origin.
 * @param hostnames - Desktop document hosts allowed for this operation.
 */
export function assertDesktopSender(event: IpcMainInvokeEvent, hostnames: readonly string[]): void {
  const senderFrame = event.senderFrame
  if (senderFrame === null) throw new Error('snh desktop: rejected IPC without a sender frame')
  const url = new URL(senderFrame.url)
  if (url.protocol !== `${SCHEME}:` || !hostnames.includes(url.hostname)) {
    throw new Error('snh desktop: rejected IPC from an unowned renderer')
  }
}
