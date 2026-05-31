import type Anthropic from "@anthropic-ai/sdk"

import type { ClineMessage } from "@roo-code/types"

import type { ApiMessage } from "../task-persistence"
import type { Task } from "../task/Task"

function extractTextFromAssistantMessage(message: ApiMessage): string {
	const { content } = message

	if (typeof content === "string") {
		return content.trim()
	}

	if (!Array.isArray(content)) {
		return ""
	}

	const textParts = content
		.filter(
			(block): block is Anthropic.Messages.TextBlockParam =>
				block.type === "text" && typeof block.text === "string",
		)
		.map((block) => block.text.trim())
		.filter(Boolean)

	return textParts.join("\n\n")
}

function extractLastAssistantText(apiConversationHistory: ApiMessage[]): string {
	for (let i = apiConversationHistory.length - 1; i >= 0; i--) {
		const message = apiConversationHistory[i]
		if (message.role !== "assistant") {
			continue
		}

		return extractTextFromAssistantMessage(message)
	}

	return ""
}

function extractLastSayText(clineMessages: ClineMessage[]): string {
	let completionIndex = -1

	for (let i = clineMessages.length - 1; i >= 0; i--) {
		if (clineMessages[i].say === "completion_result") {
			completionIndex = i
			break
		}
	}

	const searchEnd = completionIndex >= 0 ? completionIndex : clineMessages.length

	for (let i = searchEnd - 1; i >= 0; i--) {
		const message = clineMessages[i]
		if (message.type === "say" && message.say === "text" && message.text?.trim()) {
			return message.text.trim()
		}
	}

	return ""
}

/**
 * Build the summary returned to the parent task when a subtask completes.
 * Includes assistant prose from the final turn plus the task_completion result.
 */
export function buildSubtaskCompletionSummary(task: Task, taskCompletionResult: string): string {
	const assistantText =
		extractLastAssistantText(task.apiConversationHistory) || extractLastSayText(task.clineMessages)

	const trimmedResult = taskCompletionResult.trim()

	if (!assistantText) {
		return taskCompletionResult
	}

	if (!trimmedResult) {
		return assistantText
	}

	if (assistantText === trimmedResult) {
		return taskCompletionResult
	}

	return `${assistantText}\n\n${taskCompletionResult}`
}
