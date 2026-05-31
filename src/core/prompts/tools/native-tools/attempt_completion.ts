import type OpenAI from "openai"

const ATTEMPT_COMPLETION_DESCRIPTION = `Signal that the user's task is finished and present the final result.

REQUIRED: When you have completed the user's task, you MUST call this tool. 
Do NOT end the task with a plain-text summary — always use attempt_completion instead.
Do NOT call this tool if the task is not fully complete.

Example: Completing after updating CSS
{ "result": "I've updated the CSS to use flexbox layout for better responsiveness" }`

const RESULT_PARAMETER_DESCRIPTION = `Conclusive final result message. Required whenever the task is done.`

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
