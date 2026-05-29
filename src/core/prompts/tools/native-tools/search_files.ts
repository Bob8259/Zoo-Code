import type OpenAI from "openai"

const SEARCH_FILES_DESCRIPTION = `Perform a regex search across files in a directory, returning matches with surrounding context.

Parameters:
- path: (required) Workspace-relative directory to search recursively.
- regex: (required) Rust-compatible regular expression.
- file_pattern: (optional) Glob pattern to filter files (e.g. '*.ts'). Searches all files if omitted.

Example: Searching for all .ts files in the current directory
{ "path": ".", "regex": ".*", "file_pattern": "*.ts" }

Example: Searching for function definitions in JavaScript files
{ "path": "src", "regex": "function\\s+\\w+", "file_pattern": "*.js" }`

const PATH_PARAMETER_DESCRIPTION = `Workspace-relative directory to search recursively`

const REGEX_PARAMETER_DESCRIPTION = `Rust-compatible regular expression`

const FILE_PATTERN_PARAMETER_DESCRIPTION = `Optional glob to filter files (e.g. *.ts)`

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
