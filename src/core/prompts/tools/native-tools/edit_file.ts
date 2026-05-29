import type OpenAI from "openai"

const EDIT_FILE_DESCRIPTION = `Replace text in an existing file, or create a new file. old_string should match the file contents exactly, including whitespace and indentation; use empty string "" to create a new file. For single replacements, include enough surrounding context to uniquely identify the target. Use expected_replacements only when intentionally replacing multiple occurrences.`

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
					description: "Path to the file to modify or create, relative or absolute",
				},
				old_string: {
					type: "string",
					description:
						'Exact literal text to replace, including whitespace and indentation. Include 3+ lines of context for uniqueness; use empty string "" to create a new file.',
				},
				new_string: {
					type: "string",
					description: "Replacement text, or complete new file content when old_string is empty",
				},
				expected_replacements: {
					type: "number",
					description:
						"Number of occurrences expected to be replaced. Defaults to 1; set only for intentional multi-replacement edits.",
					minimum: 1,
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default edit_file
