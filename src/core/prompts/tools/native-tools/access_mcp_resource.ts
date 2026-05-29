import type OpenAI from "openai"

const ACCESS_MCP_RESOURCE_DESCRIPTION = `Access a resource provided by a connected MCP server (e.g. files, API responses, system info).`

const SERVER_NAME_PARAMETER_DESCRIPTION = `Name of the MCP server`

const URI_PARAMETER_DESCRIPTION = `URI identifying the resource`

export default {
	type: "function",
	function: {
		name: "access_mcp_resource",
		description: ACCESS_MCP_RESOURCE_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				server_name: {
					type: "string",
					description: SERVER_NAME_PARAMETER_DESCRIPTION,
				},
				uri: {
					type: "string",
					description: URI_PARAMETER_DESCRIPTION,
				},
			},
			required: ["server_name", "uri"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
