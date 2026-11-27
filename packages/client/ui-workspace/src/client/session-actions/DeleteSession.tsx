/** Permanent Session delete: the row button raises the request, the overlay dialog confirms and calls the Host. */
import { useState } from 'react'
import { Button, IconTrashOutlineRegular, Modal, Tooltip } from '@supernova-ai/snh-client-ui-primitives'
import type {
  DeleteSessionInjected, SessionDeleteDialogInjected, SessionDeleteDialogProps, SessionDeleteRequest, SessionRowActionProps,
} from '../contract/slots.ts'
import css from '../rows/Rows.module.css'
import browserCss from '../rows/WorkspaceBrowser.module.css'

/**
 * Hover button (order 150): ask to permanently delete a Session. Unlike archiving, nothing is kept, so a
 * click only raises the confirmation request. Absent while the Session's access snapshot excludes deleting.
 * @param props - owner share, the access Hook, the delete share, and the locale seat.
 * @returns the button, or nothing when the caller may not delete this Session.
 */
export function DeleteSessionRowButton({
  sessionId, displayTitle, useSessionAccess, requestSessionDelete, t,
}: SessionRowActionProps<DeleteSessionInjected>) {
  const allowed = useSessionAccess(sessionId, 'session/delete')
  if (!allowed) return null
  return (
    <Tooltip label={t('actions.delete')} side="bottom" align="end" delayMs={500} portal>
      <button
        type="button"
        className={css.iconButton}
        aria-label={t('actions.delete')}
        onClick={() => { requestSessionDelete(sessionId, displayTitle) }}
      >
        <IconTrashOutlineRegular size={14} />
      </button>
    </Tooltip>
  )
}

/**
 * The `shell.overlay` entry: the permanent-delete confirmation for the pending request, so it outlives the
 * row menu or button that raised it.
 * @param props - the request hook, its settlement, the delete hop, and the locale seat.
 * @returns the open dialog, or null.
 */
export function SessionDeleteDialog({
  useDeleteRequest, settleSessionDelete, deleteSession, t,
}: SessionDeleteDialogProps) {
  const request = useDeleteRequest(pending => pending)
  if (request === null) return null
  return (
    <DeleteConfirmForm
      key={request.sessionId}
      request={request}
      deleteSession={deleteSession}
      onSettle={settleSessionDelete}
      t={t}
    />
  )
}

/** One request's dialog: in-flight and error state die with it. A Host refusal stays here as its message. */
function DeleteConfirmForm({ request, deleteSession, onSettle, t }: {
  request: SessionDeleteRequest
  deleteSession: SessionDeleteDialogInjected['deleteSession']
  onSettle: () => void
  t: SessionDeleteDialogProps['t']
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const close = () => {
    if (deleting) return
    onSettle()
  }
  const confirm = () => {
    setDeleting(true)
    setError(null)
    deleteSession(request.sessionId).then(() => {
      setDeleting(false)
      onSettle()
    }).catch((reason: unknown) => {
      setDeleting(false)
      setError(reason instanceof Error ? reason.message : String(reason))
    })
  }
  return (
    <Modal
      open
      onClose={close}
      closeLabel={t('close')}
      title={t('deleteSession.title')}
      description={t('deleteSession.desc', { title: request.displayTitle })}
      footer={(
        <>
          <Button variant="outline" disabled={deleting} onClick={close}>{t('cancel')}</Button>
          <Button variant="outline" className={browserCss.deleteAction} disabled={deleting} onClick={confirm}>
            {t('deleteSession.action')}
          </Button>
        </>
      )}
    >
      {deleting && <div className={browserCss.deleteStatus} role="status">{t('deleteSession.pending')}</div>}
      {error !== null && <div className={browserCss.renameError} role="alert">{error}</div>}
    </Modal>
  )
}
