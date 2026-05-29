import type OpenAI from "openai"

const UPDATE_TODO_LIST_DESCRIPTION = `Replace the entire TODO list with an updated checklist. Always provide the full list in execution order, using [ ] for pending, [x] for completed, and [-] for in progress. Update statuses as work progresses and add newly discovered actionable items when useful.`

const TODOS_PARAMETER_DESCRIPTION = `Full single-level markdown checklist in execution order, using [ ], [x], and [-] status markers`

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
