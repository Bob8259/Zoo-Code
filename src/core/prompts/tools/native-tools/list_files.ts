import type OpenAI from "openai"

const LIST_FILES_DESCRIPTION = `List files and folders in a directory. Do not use this tool to confirm files you just created.

Parameters:
- path: (required) Target directory relative to workspace.
- recursive: (required) True to list recursively; false for top-level only.

Example: Listing all files in the current directory (top-level only)
{ "path": ".", "recursive": false }

Example: Listing all files recursively in src directory
{ "path": "src", "recursive": true }`

const PATH_PARAMETER_DESCRIPTION = `Relative path to inspect`

const RECURSIVE_PARAMETER_DESCRIPTION = `True to list recursively; false for top-level only`

export default {
	type: "function",
	function: {
		name: "list_files",
		description: LIST_FILES_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: PATH_PARAMETER_DESCRIPTION,
				},
				recursive: {
					type: "boolean",
					description: RECURSIVE_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "recursive"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
