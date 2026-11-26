/** Browser-safe wire types of the SuperNova chat export importer. */

import type {} from '@supernova-ai/snh-typert-protocol'

declare module '@supernova-ai/snh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** Only the owner may import; every other principal is refused. */
    'supernovaChatImport/owner-only': {}
  }
}

/** Why an import stopped as a whole. */
export type SupernovaChatImportFailureReason =
  | 'too-large'
  | 'unreadable-archive'
  | 'missing-manifest'
  | 'missing-index'
  | 'unsupported-version'
  | 'no-conversations'
  | 'workspace-not-found'
  | 'busy'

/** One conversation that was not imported. */
export interface SupernovaChatImportSkip {
  /** Conversation id from the export index, or the entry name when the file could not be parsed. */
  conversationId: string
  /** Title from the conversation file when it was parsed, otherwise null. */
  title: string | null
  /** English diagnostic naming the defect. */
  reason: string
}

/** Summary of one completed import. */
export interface SupernovaChatImportResult {
  /** Workspace that received the imported Sessions. */
  workspaceId: string
  /** Canonical directory of that Workspace, the working directory of every imported Session. */
  workspacePath: string
  /** Imported Sessions, newest first by the export index. */
  sessionIds: string[]
  /** Conversations the export index lists. */
  conversationCount: number
  /** Conversations the index lists that no attempt reached. */
  omittedByLimit: number
  /** Chosen conversations that could not be imported. */
  skipped: SupernovaChatImportSkip[]
}

/** Import limits the browser checks before uploading. */
export interface SupernovaChatImportLimits {
  /** Largest export archive, in bytes, one upload may carry. */
  maxUploadBytes: number
}

/** Final outcome of one upload. */
export type SupernovaChatImportResponse =
  | { ok: true; value: SupernovaChatImportResult }
  | { ok: false; error: { reason: SupernovaChatImportFailureReason; message: string } }

/**
 * One line of the upload route's `application/x-ndjson` answer: progress
 * lines while Sessions are written, then exactly one outcome line. A response
 * that ends without an outcome line was interrupted.
 */
export type SupernovaChatImportLine =
  | {
    type: 'progress'
    /** Sessions imported so far. */
    done: number
    /** Sessions the import tries to write: the configured limit or the number of valid conversations, whichever is smaller. */
    total: number
  }
  | { type: 'outcome'; outcome: SupernovaChatImportResponse }
