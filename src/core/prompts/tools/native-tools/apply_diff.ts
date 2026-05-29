import type OpenAI from "openai"

const APPLY_DIFF_DESCRIPTION = `Surgically modify a file using search/replace blocks.

CRITICAL REQUIREMENTS:
1. Ensure the text in the SEARCH block matches the literal file content exactly (whitespace, indentation, line endings).
2. Strip out all line number prefixes (e.g. remove ':130 | ') from SEARCH blocks.
3. Replace any hidden non-breaking spaces with standard spaces or tabs for indentation.
4. Provide multiple search/replace blocks in the 'diff' parameter for multiple changes. Use 'read_file' first if unsure.`

const DIFF_PARAMETER_DESCRIPTION = `One or more search/replace blocks defining the changes. The ':start_line:' prefix followed by the 1-based line number (without brackets) is required. Format:
<<<<<<< SEARCH
:start_line:10
-------
const x = 1;
=======
const x = 2;
>>>>>>> REPLACE`

export const apply_diff = {
	type: "function",
	function: {
		name: "apply_diff",
		description: APPLY_DIFF_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: "The path of the file to modify, relative to the current workspace directory.",
				},
				diff: {
					type: "string",
					description: DIFF_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "diff"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
