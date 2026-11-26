/**
 * Test-only client roster of the assembled viewer page.
 *
 * A served viewer page is the owner's own Web shell with the owner's client plugins; this roster is the
 * subset the viewer page specs need: the wire plugin, the Gateway, remote access, the Session/Workspace controllers,
 * Session status, the menu service, presentation plugins, and the Liveshare `./client` face, which mounts the viewer
 * surfaces when the carrier names a share. Every row is the package's own `/client` face registered as a module-table
 * factory. It must be imported only after {@link prepareViewerRemoteFaces} answered the generated
 * `/remote` faces these plugins import.
 *
 * @module @supernova-ai/snh-experimental-liveshare/tests/viewer-page-roster
 */

import * as apiGateway from '@supernova-ai/snh-api-gateway/client'
import * as apiRemoteAccess from '@supernova-ai/snh-api-remote-access/client'
import * as apiRemotes from '@supernova-ai/snh-api-remotes/client'
import * as apiSessionController from '@supernova-ai/snh-api-session-controller/client'
import * as apiWorkspaceController from '@supernova-ai/snh-api-workspace-controller/client'
import * as clientConnection from '@supernova-ai/snh-client-connection/client'
import * as clientFileUpload from '@supernova-ai/snh-client-file-upload/client'
import * as clientLocale from '@supernova-ai/snh-client-locale/client'
import * as clientModules from '@supernova-ai/snh-client-modules/client'
import * as clientResources from '@supernova-ai/snh-client-resources/client'
import * as clientShortcuts from '@supernova-ai/snh-client-shortcuts/client'
import * as uiAttachment from '@supernova-ai/snh-client-ui-attachment/client'
import * as uiChat from '@supernova-ai/snh-client-ui-chat/client'
import * as uiContextMenu from '@supernova-ai/snh-client-ui-context-menu/client'
import * as uiConversation from '@supernova-ai/snh-client-ui-conversation/client'
import * as uiDeliverables from '@supernova-ai/snh-client-ui-deliverables/client'
import * as uiFileDrag from '@supernova-ai/snh-client-ui-file-drag/client'
import * as uiLayout from '@supernova-ai/snh-client-ui-layout/client'
import * as uiRenderer from '@supernova-ai/snh-client-ui-renderer/client'
import * as uiSession from '@supernova-ai/snh-client-ui-session/client'
import * as uiSessionStatus from '@supernova-ai/snh-client-ui-session-status/client'
import * as uiSettings from '@supernova-ai/snh-client-ui-settings/client'
import * as uiSidebar from '@supernova-ai/snh-client-ui-sidebar/client'
import * as uiSidebarRight from '@supernova-ai/snh-client-ui-sidebar-right/client'
import * as uiTheme from '@supernova-ai/snh-client-ui-theme/client'
import * as uiTool from '@supernova-ai/snh-client-ui-tool/client'
import * as uiTrajectory from '@supernova-ai/snh-client-ui-trajectory/client'
import * as uiWorkspace from '@supernova-ai/snh-client-ui-workspace/client'
import * as typertRegistry from '@supernova-ai/snh-typert-registry/client'
import * as liveshare from '../src/client/index.ts'

/** One module-table row: the entry id the Loader creates, and that plugin's client exports. */
export interface ViewerPageRosterRow {
  readonly id: string
  readonly exports: Readonly<Record<string, unknown>>
}

/** Entry id of the module-system bootstrap whose exports the facade hands to the module system. */
export const VIEWER_PAGE_BOOTSTRAP_ID = '@supernova-ai/snh-client-modules'

/** The viewer page roster; Cordis composes these entries by service injection, so order is irrelevant. */
export const VIEWER_PAGE_ROSTER: readonly ViewerPageRosterRow[] = [
  { id: '@supernova-ai/snh-typert-registry', exports: typertRegistry },
  { id: '@supernova-ai/snh-experimental-liveshare', exports: liveshare },
  { id: VIEWER_PAGE_BOOTSTRAP_ID, exports: clientModules },
  { id: '@supernova-ai/snh-client-connection', exports: clientConnection },
  { id: '@supernova-ai/snh-api-gateway', exports: apiGateway },
  { id: '@supernova-ai/snh-api-remote-access', exports: apiRemoteAccess },
  { id: '@supernova-ai/snh-api-remotes', exports: apiRemotes },
  { id: '@supernova-ai/snh-api-session-controller', exports: apiSessionController },
  { id: '@supernova-ai/snh-api-workspace-controller', exports: apiWorkspaceController },
  { id: '@supernova-ai/snh-client-file-upload', exports: clientFileUpload },
  { id: '@supernova-ai/snh-client-locale', exports: clientLocale },
  { id: '@supernova-ai/snh-client-resources', exports: clientResources },
  { id: '@supernova-ai/snh-client-shortcuts', exports: clientShortcuts },
  { id: '@supernova-ai/snh-client-ui-renderer', exports: uiRenderer },
  { id: '@supernova-ai/snh-client-ui-theme', exports: uiTheme },
  { id: '@supernova-ai/snh-client-ui-settings', exports: uiSettings },
  { id: '@supernova-ai/snh-client-ui-layout', exports: uiLayout },
  { id: '@supernova-ai/snh-client-ui-session', exports: uiSession },
  { id: '@supernova-ai/snh-client-ui-session-status', exports: uiSessionStatus },
  { id: '@supernova-ai/snh-client-ui-sidebar', exports: uiSidebar },
  { id: '@supernova-ai/snh-client-ui-conversation', exports: uiConversation },
  { id: '@supernova-ai/snh-client-ui-chat', exports: uiChat },
  { id: '@supernova-ai/snh-client-ui-context-menu', exports: uiContextMenu },
  { id: '@supernova-ai/snh-client-ui-tool', exports: uiTool },
  { id: '@supernova-ai/snh-client-ui-attachment', exports: uiAttachment },
  { id: '@supernova-ai/snh-client-ui-file-drag', exports: uiFileDrag },
  { id: '@supernova-ai/snh-client-ui-sidebar-right', exports: uiSidebarRight },
  { id: '@supernova-ai/snh-client-ui-trajectory', exports: uiTrajectory },
  { id: '@supernova-ai/snh-client-ui-deliverables', exports: uiDeliverables },
  { id: '@supernova-ai/snh-client-ui-workspace', exports: uiWorkspace },
]
