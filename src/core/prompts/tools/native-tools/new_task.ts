import type OpenAI from "openai"

const NEW_TASK_DESCRIPTION = `Create a new task instance in a chosen mode with a message and initial todo list.

CRITICAL: Call this tool alone. Do NOT call it alongside other tools in the same turn. Gather necessary information in preceding turns first.`

const MODE_PARAMETER_DESCRIPTION = `Mode slug to begin the new task in (e.g. code, debug, architect)`

const MESSAGE_PARAMETER_DESCRIPTION = `Initial instructions or context`

const TODOS_PARAMETER_DESCRIPTION = `Optional initial todo markdown checklist`

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
