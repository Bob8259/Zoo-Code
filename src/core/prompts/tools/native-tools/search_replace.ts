import type OpenAI from "openai"

const SEARCH_REPLACE_DESCRIPTION = `Propose a search and replace operation on an existing file. This replaces one occurrence, so old_string must uniquely identify the target and match exactly, including whitespace and indentation. Include surrounding context before and after the change point.`

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
					description:
						"Exact unique text to replace, including whitespace and indentation; include 3-5 context lines before and after",
				},
				new_string: {
					type: "string",
					description: "Replacement text, different from old_string",
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default search_replace
