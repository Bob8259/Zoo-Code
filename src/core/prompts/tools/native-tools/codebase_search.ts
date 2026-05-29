import type OpenAI from "openai"

const CODEBASE_SEARCH_DESCRIPTION = `Find relevant files using semantic search. Searches by meaning, not exact text. Default scope is the entire workspace. Queries MUST be in English.

CRITICAL: Use this tool FIRST before any other search/exploration tool for ANY new area of code in this conversation. It is much more effective than regex search for understanding implementations. Reuse the user's phrasing when possible.

Example: Searching for user authentication code
{ "query": "User login and password hashing", "path": "src/auth" }

Example: Searching entire workspace
{ "query": "database connection pooling", "path": null }`

const QUERY_PARAMETER_DESCRIPTION = `Meaning-based search query in English`

const PATH_PARAMETER_DESCRIPTION = `Optional relative subdirectory to limit the search scope`

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
