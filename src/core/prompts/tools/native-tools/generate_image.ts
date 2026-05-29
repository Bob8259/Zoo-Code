import type OpenAI from "openai"

const GENERATE_IMAGE_DESCRIPTION = `Generate or edit an image using AI models. Can create new images or modify existing ones.`

const PROMPT_PARAMETER_DESCRIPTION = `Text prompt describing what to generate or edit`

const PATH_PARAMETER_DESCRIPTION = `Path (relative to workspace) to save the resulting image`

const IMAGE_PARAMETER_DESCRIPTION = `Optional relative path to an existing image to edit (PNG, JPG, JPEG, GIF, WEBP)`

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
