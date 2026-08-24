import { Task } from "../task/Task"
import { formatResponse } from "../prompts/responses"
import type { ToolUse } from "../../shared/tools"
import { Package } from "../../shared/package"
import { t } from "../../i18n"
import { showSystemNotification } from "../../utils/system-notification"

import { BaseTool, ToolCallbacks } from "./BaseTool"

interface Suggestion {
	text: string
	mode?: string
}

interface AskFollowupQuestionParams {
	question: string
	follow_up: Suggestion[]
}

const QUESTION_NOTIFICATION_MAX_LENGTH = 200

export class AskFollowupQuestionTool extends BaseTool<"ask_followup_question"> {
	readonly name = "ask_followup_question" as const

	async execute(params: AskFollowupQuestionParams, task: Task, callbacks: ToolCallbacks): Promise<void> {
		const { question, follow_up } = params
		const { handleError, pushToolResult } = callbacks

		// Subtasks should not ask the user questions — they should complete work directly
		if (task.parentTaskId) {
			task.consecutiveMistakeCount++
			task.recordToolError("ask_followup_question")
			task.didToolFailInCurrentTurn = true
			pushToolResult(
				formatResponse.toolError(
					"ask_followup_question is not available in delegated subtasks. Complete the work directly and use task_completion.",
				),
			)
			return
		}

		const recordMissingParamError = async (paramName: string): Promise<void> => {
			task.consecutiveMistakeCount++
			task.recordToolError("ask_followup_question")
			task.didToolFailInCurrentTurn = true
			pushToolResult(await task.sayAndCreateMissingParamError("ask_followup_question", paramName))
		}

		try {
			if (!question) {
				await recordMissingParamError("question")
				return
			}

			if (!follow_up || !Array.isArray(follow_up)) {
				await recordMissingParamError("follow_up")
				return
			}

			// Transform follow_up suggestions to the format expected by task.ask
			const follow_up_json = {
				question,
				suggest: follow_up.map((s) => ({ answer: s.text, mode: s.mode })),
			}

			task.consecutiveMistakeCount = 0

			const provider = task.providerRef?.deref()
			const state = provider ? await provider.getState() : undefined
			if (state?.notifyOnTaskComplete ?? true) {
				const truncatedQuestion =
					question.length > QUESTION_NOTIFICATION_MAX_LENGTH
						? `${question.slice(0, QUESTION_NOTIFICATION_MAX_LENGTH - 1)}…`
						: question
				void showSystemNotification({
					title: Package.outputChannel,
					message: t("common:info.agent_question", { question: truncatedQuestion }),
				})
			}

			const { text, images } = await task.ask("followup", JSON.stringify(follow_up_json), false)
			await task.say("user_feedback", text ?? "", images)
			pushToolResult(formatResponse.toolResult(`<user_message>\n${text}\n</user_message>`, images))
		} catch (error) {
			await handleError("asking question", error as Error)
		}
	}

	override async handlePartial(task: Task, block: ToolUse<"ask_followup_question">): Promise<void> {
		const question: string | undefined = block.nativeArgs?.question ?? block.params.question

		// During partial streaming, only show the question to avoid displaying raw JSON
		// The full JSON with suggestions will be sent when the tool call is complete (!block.partial)
		await task.ask("followup", question ?? "", block.partial).catch(() => {})
	}
}

export const askFollowupQuestionTool = new AskFollowupQuestionTool()
