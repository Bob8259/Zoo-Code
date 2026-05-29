import type OpenAI from "openai"

const EDIT_DESCRIPTION = `Perform exact string replacements in files.

Usage Requirements:
1. You MUST read the file first using a Read tool in the conversation.
2. Match exact indentation (tabs/spaces) as it appears AFTER the line number prefix (spaces + line number + tab). Never include the line number prefix in old_string or new_string.
3. Prefer editing existing files.
4. Do not add emojis unless explicitly requested.
5. The edit will fail if old_string is not unique. Provide more surrounding context to make it unique, or set replace_all to true to replace all instances.`

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
					description: "The path of the file to edit (relative to the working directory)",
				},
				old_string: {
					type: "string",
					description:
						"The exact text to find in the file. Must match exactly, including all whitespace, indentation, and line endings.",
				},
				new_string: {
					type: "string",
					description:
						"The replacement text that will replace old_string. Must include all necessary whitespace and indentation.",
				},
				replace_all: {
					type: "boolean",
					description:
						"When true, replaces ALL occurrences of old_string in the file. When false (default), only replaces the first occurrence and errors if multiple matches exist.",
					default: false,
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default edit
