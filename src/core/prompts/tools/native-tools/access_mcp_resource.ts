import type OpenAI from "openai"

const ACCESS_MCP_RESOURCE_DESCRIPTION = `Access a resource provided by a connected MCP server. Resources are context data such as files, API responses, or system information, identified by the server name and resource URI.`

const SERVER_NAME_PARAMETER_DESCRIPTION = `Name of the MCP server providing the resource`

const URI_PARAMETER_DESCRIPTION = `URI identifying the specific resource to access`

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
