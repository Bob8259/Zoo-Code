import type OpenAI from "openai"

const WRITE_TO_FILE_DESCRIPTION = `Write complete content to a file, creating it if needed or overwriting it if it exists. Prefer targeted editing tools for existing files unless a full rewrite is intentional. Always provide the complete intended file content; partial content or placeholders will leave the file incomplete.`

const PATH_PARAMETER_DESCRIPTION = `Relative path of the file to write to`

const CONTENT_PARAMETER_DESCRIPTION = `Complete intended content of the file. Do NOT truncate, omit unchanged sections, use placeholders, or include line numbers.`

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
