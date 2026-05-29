import type OpenAI from "openai"

const EDIT_DESCRIPTION = `Performs exact string replacements in files. The old_string must uniquely match the file contents exactly. You must read the file first before editing.`

const edit = {
	type: "function",
	function: {
		name: "edit",
		description: EDIT_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Relative path of the file to edit",
				},
				old_string: {
					type: "string",
					description: "The exact unique text to find in the file",
				},
				new_string: {
					type: "string",
					description: "The replacement text",
				},
				replace_all: {
					type: "boolean",
					description:
						"If true, replace all occurrences; if false, replace only the first and error if not unique",
					default: false,
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default edit
