import type OpenAI from "openai"

const ASK_FOLLOWUP_QUESTION_DESCRIPTION = `Ask the user a question with 2-4 suggested responses to clarify requirements.`

const QUESTION_PARAMETER_DESCRIPTION = `Question to ask the user`

const FOLLOW_UP_PARAMETER_DESCRIPTION = `2-4 complete suggested responses`

const FOLLOW_UP_TEXT_DESCRIPTION = `Suggested answer text`

const FOLLOW_UP_MODE_DESCRIPTION = `Optional mode to switch to (e.g. code, architect)`

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
