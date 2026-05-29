import type OpenAI from "openai"

const SKILL_DESCRIPTION = `Load and execute a skill by name to follow documented procedures. Use only for skills listed in the available skills section, and pass any task-relevant context as args.`

const SKILL_PARAMETER_DESCRIPTION = `Name of the skill to load; must match an available skill name`

const ARGS_PARAMETER_DESCRIPTION = `Optional context or arguments to pass to the skill`

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
