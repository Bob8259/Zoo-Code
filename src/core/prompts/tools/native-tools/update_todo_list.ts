import type OpenAI from "openai"

const UPDATE_TODO_LIST_DESCRIPTION = `Replace the entire TODO list with an updated checklist. Use [ ] (pending), [x] (completed), [-] (in progress).`

const TODOS_PARAMETER_DESCRIPTION = `Full markdown checklist in execution order`

export default {
	type: "function",
	function: {
		name: "update_todo_list",
		description: UPDATE_TODO_LIST_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				todos: {
					type: "string",
					description: TODOS_PARAMETER_DESCRIPTION,
				},
			},
			required: ["todos"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
