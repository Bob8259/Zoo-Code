import type OpenAI from "openai"

const WRITE_TO_FILE_DESCRIPTION = `Write complete content to a file. Overwrites existing files or creates new files and directories.

CRITICAL:
1. Prefer other edit tools for modifications. Use write_to_file primarily for new file creation.
2. ALWAYS provide the COMPLETE file content in your parameter. Partial updates or placeholders are strictly forbidden.

Example: Writing a configuration file
{ "path": "frontend-config.json", "content": "{\\n  \\"apiEndpoint\\": \\"https://api.example.com\\",\\n  \\"theme\\": {\\n    \\"primaryColor\\": \\"#007bff\\"\\n  }\\n}" }`

const PATH_PARAMETER_DESCRIPTION = `Workspace-relative file path`

const CONTENT_PARAMETER_DESCRIPTION = `Complete file content to write. Do NOT include line numbers, partial updates, or placeholders.`

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
