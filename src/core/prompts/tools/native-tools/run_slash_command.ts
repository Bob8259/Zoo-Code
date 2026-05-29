import type OpenAI from "openai"

const RUN_SLASH_COMMAND_DESCRIPTION = `Execute a slash command to get instructions or content.`

const COMMAND_PARAMETER_DESCRIPTION = `Name of the slash command`

const ARGS_PARAMETER_DESCRIPTION = `Optional command arguments`

export default {
	type: "function",
	function: {
		name: "run_slash_command",
		description: RUN_SLASH_COMMAND_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				command: {
					type: "string",
					description: COMMAND_PARAMETER_DESCRIPTION,
				},
				args: {
					type: ["string", "null"],
					description: ARGS_PARAMETER_DESCRIPTION,
				},
			},
			required: ["command", "args"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
