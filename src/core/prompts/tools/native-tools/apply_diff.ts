import type OpenAI from "openai"

const APPLY_DIFF_DESCRIPTION = `Edit an existing file by replacing an exact string.

Usage requirements:
1. Read the file first so old_string matches the current contents.
2. Match old_string exactly, including whitespace, indentation, and punctuation.
3. Include enough surrounding context in old_string to make it unique.
4. Use replace_all only when every occurrence should be changed.
5. For multiple unrelated changes, make separate apply_diff calls.`

const apply_diff = {
	type: "function",
	function: {
		name: "apply_diff",
		description: APPLY_DIFF_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "The path of the file to edit, relative to the current workspace directory.",
				},
				old_string: {
					type: "string",
					description:
						"The exact text to find and replace. It must match the file contents exactly, including whitespace and indentation.",
				},
				new_string: {
					type: "string",
					description: "The replacement text. It must be different from old_string.",
				},
				replace_all: {
					type: "boolean",
					description:
						"When true, replace every occurrence of old_string. When false (default), old_string must be unique.",
					default: false,
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export { apply_diff }
export default apply_diff
