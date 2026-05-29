import type OpenAI from "openai"

const UPDATE_TODO_LIST_DESCRIPTION = `Replace the TODO list with an updated checklist. Always provide the full, single-level markdown checklist.

Checklist Format:
- Status options: [ ] (pending), [x] (completed), [-] (in progress)
- List items in execution order.

Core Principles:
- Confirm completed items before updating.
- Multiple statuses can be updated at once.
- Dynamically add new tasks as they are discovered.
- Keep all unfinished tasks unless instructed otherwise.

Example: Initial task list
{ "todos": "[x] Analyze requirements\\n[x] Design architecture\\n[-] Implement core logic\\n[ ] Write tests\\n[ ] Update documentation" }

Example: After completing implementation
{ "todos": "[x] Analyze requirements\\n[x] Design architecture\\n[x] Implement core logic\\n[-] Write tests\\n[ ] Update documentation\\n[ ] Add performance benchmarks" }

Use when the task involves multiple steps requiring progress tracking. Do not use for simple, single-step, or conversational tasks.`

const TODOS_PARAMETER_DESCRIPTION = `Full markdown checklist: [ ] (pending), [x] (completed), [-] (in progress)`

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
