import type OpenAI from "openai"

const RUN_SLASH_COMMAND_DESCRIPTION = `Execute a predefined slash command (template) for detailed guidance on common tasks.`

const COMMAND_PARAMETER_DESCRIPTION = `Name of the slash command (e.g. init, test, deploy)`

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
