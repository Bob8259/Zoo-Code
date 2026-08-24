import type { ClineMessage } from "@roo-code/types"
import type { ApiMessage } from "../task-persistence/apiMessages"

export interface PendingEditData {
	messageTs: number
	editedContent: string
	images?: string[]
}

export interface PendingEditTask {
	clineMessages: ClineMessage[]
	apiConversationHistory: ApiMessage[]
	overwriteClineMessages: (messages: ClineMessage[]) => Promise<void>
	overwriteApiConversationHistory: (messages: ApiMessage[]) => Promise<void>
	handleWebviewAskResponse: (response: "messageResponse", text?: string, images?: string[]) => void
}

/**
 * Applies an edit after a checkpoint restore has rehydrated the task.
 *
 * Restoring an edit checkpoint rewinds through (and therefore removes) the
 * original message. The replacement must still be submitted when that
 * message is no longer present; its absence is the normal restore outcome.
 */
export async function processPendingEdit(task: PendingEditTask, pendingEdit: PendingEditData): Promise<void> {
	const messageIndex = task.clineMessages.findIndex((message) => message.ts === pendingEdit.messageTs)
	if (messageIndex !== -1) {
		await task.overwriteClineMessages(task.clineMessages.slice(0, messageIndex))
	}

	const apiConversationHistoryIndex = task.apiConversationHistory.findIndex(
		(message) => message.ts === pendingEdit.messageTs,
	)
	if (apiConversationHistoryIndex !== -1) {
		await task.overwriteApiConversationHistory(task.apiConversationHistory.slice(0, apiConversationHistoryIndex))
	}

	await task.handleWebviewAskResponse("messageResponse", pendingEdit.editedContent, pendingEdit.images)
}
