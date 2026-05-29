import type OpenAI from "openai"

const NEW_TASK_DESCRIPTION = `Create a new task in the chosen mode. CRITICAL: This tool MUST be called alone in its own turn.`

const MODE_PARAMETER_DESCRIPTION = `Slug of the mode to start the task in (e.g. code, debug, architect)`

const MESSAGE_PARAMETER_DESCRIPTION = `Initial instructions or context for the new task`

const TODOS_PARAMETER_DESCRIPTION = `Optional initial todo list as a markdown checklist`

export default {
	type: "function",
	function: {
		name: "new_task",
		description: NEW_TASK_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				mode: {
					type: "string",
					description: MODE_PARAMETER_DESCRIPTION,
				},
				message: {
					type: "string",
					description: MESSAGE_PARAMETER_DESCRIPTION,
				},
				todos: {
					type: ["string", "null"],
					description: TODOS_PARAMETER_DESCRIPTION,
				},
			},
			required: ["mode", "message", "todos"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
