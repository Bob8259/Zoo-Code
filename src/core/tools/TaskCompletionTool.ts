import * as vscode from "vscode"

import { RooCodeEventName, type HistoryItem } from "@roo-code/types"
import { TelemetryService } from "@roo-code/telemetry"

import { Task } from "../task/Task"
import { formatResponse } from "../prompts/responses"
import { Package } from "../../shared/package"
import type { ToolUse } from "../../shared/tools"
import { t } from "../../i18n"
import { showSystemNotification } from "../../utils/system-notification"

import { BaseTool, ToolCallbacks } from "./BaseTool"
import { buildSubtaskCompletionSummary } from "./buildSubtaskCompletionSummary"

interface TaskCompletionParams {
	result: string
	command?: string
}

export interface TaskCompletionCallbacks extends ToolCallbacks {
	toolDescription: () => string
}

/**
 * Interface for provider methods needed by TaskCompletionTool for delegation handling.
 */
interface DelegationProvider {
	getTaskWithId(id: string): Promise<{ historyItem: HistoryItem }>
	reopenParentFromDelegation(params: {
		parentTaskId: string
		childTaskId: string
		completionResultSummary: string
	}): Promise<void>
}

export class TaskCompletionTool extends BaseTool<"task_completion"> {
	readonly name = "task_completion" as const

	async execute(params: TaskCompletionParams, task: Task, callbacks: TaskCompletionCallbacks): Promise<void> {
		const { result } = params
		const { handleError, pushToolResult } = callbacks

		// Prevent task_completion if any tool failed in the current turn
		if (task.didToolFailInCurrentTurn) {
			const errorMsg = t("common:errors.task_completion_tool_failed")

			await task.say("error", errorMsg)
			pushToolResult(formatResponse.toolError(errorMsg))
			return
		}

		const preventCompletionWithOpenTodos = vscode.workspace
			.getConfiguration(Package.name)
			.get<boolean>("preventCompletionWithOpenTodos", false)

		const hasIncompleteTodos = task.todoList && task.todoList.some((todo) => todo.status !== "completed")

		if (preventCompletionWithOpenTodos && hasIncompleteTodos) {
			task.consecutiveMistakeCount++
			task.recordToolError("task_completion")

			pushToolResult(
				formatResponse.toolError(
					"Cannot complete task while there are incomplete todos. Please finish all todos before attempting completion.",
				),
			)

			return
		}

		try {
			if (!result) {
				task.consecutiveMistakeCount++
				task.recordToolError("task_completion")
				pushToolResult(await task.sayAndCreateMissingParamError("task_completion", "result"))
				return
			}

			task.consecutiveMistakeCount = 0

			await task.say("completion_result", result, undefined, false)

			// Notify the user when a top-level task finishes (default: enabled).
			// Subtasks should not trigger a notification — only the parent/root task.
			const provider = task.providerRef.deref()
			if (!task.parentTaskId) {
				const state = provider ? await provider.getState() : undefined
				if (state?.notifyOnTaskComplete ?? true) {
					void showSystemNotification({
						title: Package.outputChannel,
						message: t("common:info.task_complete"),
					})
				}
			}

			// Check for subtask using parentTaskId (metadata-driven delegation).
			// The live task is the source of truth while it is executing. Child history
			// can be stale during the final message write, so an unavailable status must
			// not suppress a valid result handoff.
			if (task.parentTaskId) {
				const delegationProvider = provider as DelegationProvider | undefined
				if (delegationProvider) {
					let status: HistoryItem["status"] | undefined
					try {
						const { historyItem } = await delegationProvider.getTaskWithId(task.taskId)
						status = historyItem?.status
					} catch (err) {
						console.warn(
							`[TaskCompletionTool] Could not read child history for ${task.taskId}; attempting parent handoff: ${(err as Error)?.message ?? String(err)}`,
						)
					}

					// A delegated child still has an active descendant and must not complete
					// itself before that descendant returns. A completed child is a history
					// revisit, so do not return its result a second time.
					if (status === "delegated") {
						console.error(
							`[TaskCompletionTool] Child task ${task.taskId} is delegated to another child; skipping parent handoff.`,
						)
					} else if (status !== "completed") {
						await this.delegateToParent(task, result, delegationProvider, pushToolResult)
						this.emitTaskCompleted(task)
						return
					}
				}
			}

			const { response, text, images } = await task.ask("completion_result", "", false)

			if (response === "yesButtonClicked") {
				this.emitTaskCompleted(task)
				return
			}

			// User provided feedback - push tool result to continue the conversation
			await task.say("user_feedback", text ?? "", images)

			const feedbackText = `<user_message>\n${text}\n</user_message>`
			pushToolResult(formatResponse.toolResult(feedbackText, images))
		} catch (error) {
			await handleError("inspecting site", error as Error)
		}
	}

	/**
	 * Returns a completed subtask's result to its parent without another approval.
	 */
	private async delegateToParent(
		task: Task,
		result: string,
		provider: DelegationProvider,
		pushToolResult: (result: string) => void,
	): Promise<void> {
		pushToolResult("")

		const completionResultSummary = buildSubtaskCompletionSummary(task, result)

		await provider.reopenParentFromDelegation({
			parentTaskId: task.parentTaskId!,
			childTaskId: task.taskId,
			completionResultSummary,
		})
	}

	override async handlePartial(task: Task, block: ToolUse<"task_completion">): Promise<void> {
		const result: string | undefined = block.params.result
		const command: string | undefined = block.params.command

		const lastMessage = task.clineMessages.at(-1)

		if (command) {
			if (lastMessage && lastMessage.ask === "command") {
				await task.ask("command", command ?? "", block.partial).catch(() => {})
			} else {
				await task.say("completion_result", result ?? "", undefined, false)
				await task.ask("command", command ?? "", block.partial).catch(() => {})
			}
		} else {
			await task.say("completion_result", result ?? "", undefined, block.partial)
		}
	}

	private emitTaskCompleted(task: Task): void {
		// Force final token usage update before emitting TaskCompleted.
		// This ensures the latest stats are captured regardless of throttle timer.
		task.emitFinalTokenUsageUpdate()

		TelemetryService.instance.captureTaskCompleted(task.taskId)
		task.emit(RooCodeEventName.TaskCompleted, task.taskId, task.getTokenUsage(), task.toolUsage)
	}
}

export const taskCompletionTool = new TaskCompletionTool()
