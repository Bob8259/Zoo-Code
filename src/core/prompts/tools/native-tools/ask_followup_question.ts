import type OpenAI from "openai"

const ASK_FOLLOWUP_QUESTION_DESCRIPTION = `Ask the user a question only when additional information is needed to complete the task. Provide 2-4 suggested responses that are complete, actionable answers the user can select.`

const QUESTION_PARAMETER_DESCRIPTION = `Clear, specific question addressing the missing information`

const FOLLOW_UP_PARAMETER_DESCRIPTION = `2-4 complete suggested responses; each should be actionable and may include a mode switch`

const FOLLOW_UP_TEXT_DESCRIPTION = `Suggested answer text the user can pick`

const FOLLOW_UP_MODE_DESCRIPTION = `Optional mode slug to switch to if this suggestion is chosen (e.g. code, architect)`

export default {
	type: "function",
	function: {
		name: "ask_followup_question",
		description: ASK_FOLLOWUP_QUESTION_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				question: {
					type: "string",
					description: QUESTION_PARAMETER_DESCRIPTION,
				},
				follow_up: {
					type: "array",
					description: FOLLOW_UP_PARAMETER_DESCRIPTION,
					items: {
						type: "object",
						properties: {
							text: {
								type: "string",
								description: FOLLOW_UP_TEXT_DESCRIPTION,
							},
							mode: {
								type: ["string", "null"],
								description: FOLLOW_UP_MODE_DESCRIPTION,
							},
						},
						required: ["text", "mode"],
						additionalProperties: false,
					},
					minItems: 1,
					maxItems: 4,
				},
			},
			required: ["question", "follow_up"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
