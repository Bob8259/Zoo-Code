import type OpenAI from "openai"

const SKILL_DESCRIPTION = `Load and execute a skill by name to follow specialized procedures (e.g., creating MCP servers or custom modes). Available skills are listed in the system prompt.`

const SKILL_PARAMETER_DESCRIPTION = `Name of the skill to load (e.g. create-mcp-server, create-mode)`

const ARGS_PARAMETER_DESCRIPTION = `Optional context or arguments for the skill`

export default {
	type: "function",
	function: {
		name: "skill",
		description: SKILL_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				skill: {
					type: "string",
					description: SKILL_PARAMETER_DESCRIPTION,
				},
				args: {
					type: ["string", "null"],
					description: ARGS_PARAMETER_DESCRIPTION,
				},
			},
			required: ["skill", "args"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
