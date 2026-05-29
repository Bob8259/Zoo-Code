import type OpenAI from "openai"

const SEARCH_FILES_DESCRIPTION = `Perform a regex search across files in a specified directory.`

const PATH_PARAMETER_DESCRIPTION = `Directory path to search recursively`

const REGEX_PARAMETER_DESCRIPTION = `Rust regex pattern to match`

const FILE_PATTERN_PARAMETER_DESCRIPTION = `Optional glob pattern to filter files (e.g. *.ts)`

export default {
	type: "function",
	function: {
		name: "search_files",
		description: SEARCH_FILES_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: PATH_PARAMETER_DESCRIPTION,
				},
				regex: {
					type: "string",
					description: REGEX_PARAMETER_DESCRIPTION,
				},
				file_pattern: {
					type: ["string", "null"],
					description: FILE_PATTERN_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "regex", "file_pattern"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
