import type OpenAI from "openai"

const ASK_FOLLOWUP_QUESTION_DESCRIPTION = `Ask the user a clarifying question to gather info needed to proceed.

Parameters:
- question: (required) A specific question for missing info.
- follow_up: (required) 2-4 suggested complete, actionable answers without placeholders. Can specify a mode slug to switch modes.

Example: Asking for file path
{ "question": "What is the path to the frontend-config.json file?", "follow_up": [{ "text": "./src/frontend-config.json", "mode": null }, { "text": "./config/frontend-config.json", "mode": null }, { "text": "./frontend-config.json", "mode": null }] }

Example: Asking with mode switch
{ "question": "Would you like me to implement this feature?", "follow_up": [{ "text": "Yes, implement it now", "mode": "code" }, { "text": "No, just plan it out", "mode": "architect" }] }`

const QUESTION_PARAMETER_DESCRIPTION = `Specific question addressing the missing info`

const FOLLOW_UP_PARAMETER_DESCRIPTION = `List of 2-4 complete suggested responses`

const FOLLOW_UP_TEXT_DESCRIPTION = `Suggested answer option`

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
