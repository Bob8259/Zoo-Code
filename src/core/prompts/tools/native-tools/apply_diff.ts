import type OpenAI from "openai"

const APPLY_DIFF_DESCRIPTION = `Apply search/replace blocks to modify a file. The SEARCH block must match existing content exactly.`

const DIFF_PARAMETER_DESCRIPTION = `One or more search/replace blocks. Format:
<<<<<<< SEARCH
:start_line:[line_number]
-------
[exact content to find]
=======
[new content to replace with]
>>>>>>> REPLACE`

export const apply_diff = {
	type: "function",
	function: {
		name: "apply_diff",
		description: APPLY_DIFF_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: "The path of the file to modify, relative to the current workspace directory.",
				},
				diff: {
					type: "string",
					description: DIFF_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "diff"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
