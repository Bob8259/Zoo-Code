import type OpenAI from "openai"

const EXECUTE_COMMAND_DESCRIPTION = `Execute a CLI command. Tailor to the OS, use relative paths, and explain the command. Prefer CLI command chaining over writing shell scripts.

Parameters:
- command: (required) CLI command to execute.
- cwd: (optional) Working directory.
- timeout: (optional) Timeout in seconds. Use for long-running commands (e.g. dev servers, file watchers) to let them run in the background.

Example: Executing npm run dev
{ "command": "npm run dev", "cwd": null, "timeout": null }

Example: Executing ls in a specific directory if directed
{ "command": "ls -la", "cwd": "/home/user/projects", "timeout": null }

Example: Using relative paths
{ "command": "touch ./testdata/example.file", "cwd": null, "timeout": null }

Example: Running a build with a timeout
{ "command": "npm run build", "cwd": null, "timeout": 30 }`

const COMMAND_PARAMETER_DESCRIPTION = `Shell command to execute`

const CWD_PARAMETER_DESCRIPTION = `Optional relative or absolute working directory`

const TIMEOUT_PARAMETER_DESCRIPTION = `Timeout in seconds. Command continues in background when exceeded. Use for long-running processes like dev servers`

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
