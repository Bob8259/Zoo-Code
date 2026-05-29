import type OpenAI from "openai"

const GENERATE_IMAGE_DESCRIPTION = `Generate or edit an image using AI models. Provide a prompt describing the desired image or edit, a workspace-relative output path, and optionally an existing image path to transform.`

const PROMPT_PARAMETER_DESCRIPTION = `Text prompt describing what to generate or what edits to apply`

const PATH_PARAMETER_DESCRIPTION = `Filesystem path, relative to the workspace, where the resulting image should be saved`

const IMAGE_PARAMETER_DESCRIPTION = `Optional path, relative to the workspace, to an existing image to edit (PNG, JPG, JPEG, GIF, WEBP)`

export default {
	type: "function",
	function: {
		name: "generate_image",
		description: GENERATE_IMAGE_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				prompt: {
					type: "string",
					description: PROMPT_PARAMETER_DESCRIPTION,
				},
				path: {
					type: "string",
					description: PATH_PARAMETER_DESCRIPTION,
				},
				image: {
					type: ["string", "null"],
					description: IMAGE_PARAMETER_DESCRIPTION,
				},
			},
			required: ["prompt", "path", "image"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
