import type OpenAI from "openai"

const ATTEMPT_COMPLETION_DESCRIPTION = `Present the final task result to the user.

CRITICAL: Do NOT use this tool until you have confirmed that all previous tool uses were successful. Formulate a final, conclusive result that does not end with questions or offers for further assistance.

Example: Completing after updating CSS
{ "result": "I've updated the CSS to use flexbox layout for better responsiveness" }`

const RESULT_PARAMETER_DESCRIPTION = `Conclusive final result message`

export default {
	type: "function",
	function: {
		name: "attempt_completion",
		description: ATTEMPT_COMPLETION_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				result: {
					type: "string",
					description: RESULT_PARAMETER_DESCRIPTION,
				},
			},
			required: ["result"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
