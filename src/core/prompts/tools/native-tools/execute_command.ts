import type OpenAI from "openai"

const EXECUTE_COMMAND_DESCRIPTION = `Execute a CLI command on the system.`

const COMMAND_PARAMETER_DESCRIPTION = `Shell command to execute`

const CWD_PARAMETER_DESCRIPTION = `Optional working directory`

const TIMEOUT_PARAMETER_DESCRIPTION = `Timeout in seconds. If exceeded, the command runs in background.`

export default {
	type: "function",
	function: {
		name: "execute_command",
		description: EXECUTE_COMMAND_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				command: {
					type: "string",
					description: COMMAND_PARAMETER_DESCRIPTION,
				},
				cwd: {
					type: ["string", "null"],
					description: CWD_PARAMETER_DESCRIPTION,
				},
				timeout: {
					type: ["number", "null"],
					description: TIMEOUT_PARAMETER_DESCRIPTION,
				},
			},
			required: ["command", "cwd", "timeout"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
