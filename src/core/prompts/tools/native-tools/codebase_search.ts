import type OpenAI from "openai"

const CODEBASE_SEARCH_DESCRIPTION = `Find relevant code using semantic search based on meaning rather than exact text. Queries MUST be in English. Use this first when exploring a new or unexamined area of the codebase, then use more specific search or file-reading tools as needed.`

const QUERY_PARAMETER_DESCRIPTION = `English meaning-based search query describing the code or context you need`

const PATH_PARAMETER_DESCRIPTION = `Optional subdirectory, relative to the workspace, to limit search scope`

export default {
	type: "function",
	function: {
		name: "codebase_search",
		description: CODEBASE_SEARCH_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: QUERY_PARAMETER_DESCRIPTION,
				},
				path: {
					type: ["string", "null"],
					description: PATH_PARAMETER_DESCRIPTION,
				},
			},
			required: ["query", "path"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
