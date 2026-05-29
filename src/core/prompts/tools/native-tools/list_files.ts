import type OpenAI from "openai"

const LIST_FILES_DESCRIPTION = `List files and directories in the specified path (relative to the workspace).`

const PATH_PARAMETER_DESCRIPTION = `Relative path of the directory to inspect`

const RECURSIVE_PARAMETER_DESCRIPTION = `Whether to list files recursively`

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
