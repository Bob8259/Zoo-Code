import type OpenAI from "openai"

const WRITE_TO_FILE_DESCRIPTION = `Write complete content to a file. Creates or overwrites the file. Prefer other editing tools for existing files.`

const PATH_PARAMETER_DESCRIPTION = `Relative path of the file to write to`

const CONTENT_PARAMETER_DESCRIPTION = `Complete intended content of the file (do NOT truncate or include line numbers)`

export default {
	type: "function",
	function: {
		name: "write_to_file",
		description: WRITE_TO_FILE_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: PATH_PARAMETER_DESCRIPTION,
				},
				content: {
					type: "string",
					description: CONTENT_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "content"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
