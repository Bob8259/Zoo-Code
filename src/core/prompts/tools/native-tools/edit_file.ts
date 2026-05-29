import type OpenAI from "openai"

const EDIT_FILE_DESCRIPTION = `Replace text in an existing file, or create a new file. old_string must match exactly (use empty string "" to create a new file). For uniqueness, include surrounding context in old_string.`

const edit_file = {
	type: "function",
	function: {
		name: "edit_file",
		description: EDIT_FILE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Path to the file to modify or create",
				},
				old_string: {
					type: "string",
					description:
						'Exact text to replace (provide 3+ lines of context around it for uniqueness). Use empty string "" to create a new file.',
				},
				new_string: {
					type: "string",
					description: "Replacement text or new file content",
				},
				expected_replacements: {
					type: "number",
					description: "Number of occurrences expected to be replaced (defaults to 1)",
					minimum: 1,
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default edit_file
