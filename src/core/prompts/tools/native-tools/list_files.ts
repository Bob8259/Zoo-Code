import type OpenAI from "openai"

const LIST_FILES_DESCRIPTION = `List files and directories in the specified path, relative to the workspace. Use recursive=true to inspect nested contents and recursive=false for top-level contents only.`

const PATH_PARAMETER_DESCRIPTION = `Directory path to inspect, relative to the workspace`

const RECURSIVE_PARAMETER_DESCRIPTION = `Set true to list contents recursively; false to show only the top level`

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
