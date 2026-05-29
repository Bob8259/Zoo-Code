import type OpenAI from "openai"

const CODEBASE_SEARCH_DESCRIPTION = `Find relevant code using semantic search based on meaning. Queries MUST be in English. CRITICAL: Use this FIRST when exploring any new/unexamined areas of code in the codebase.`

const QUERY_PARAMETER_DESCRIPTION = `English search query describing the meaning/context of the code you need`

const PATH_PARAMETER_DESCRIPTION = `Optional subdirectory to limit search scope`

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
