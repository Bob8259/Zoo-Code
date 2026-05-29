import type OpenAI from "openai"

const SEARCH_REPLACE_DESCRIPTION = `Propose a search and replace operation on an existing file. old_string must uniquely match the target content exactly.`

const search_replace = {
	type: "function",
	function: {
		name: "search_replace",
		description: SEARCH_REPLACE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Relative or absolute path to the file",
				},
				old_string: {
					type: "string",
					description: "The exact unique text to replace (include 3-5 context lines)",
				},
				new_string: {
					type: "string",
					description: "The replacement text",
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default search_replace
