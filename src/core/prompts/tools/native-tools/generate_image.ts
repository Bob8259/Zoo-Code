import type OpenAI from "openai"

const GENERATE_IMAGE_DESCRIPTION = `Generate or edit an image using AI models.

Parameters:
- prompt: (required) Text prompt describing image generation or edits.
- path: (required) Target file path (relative to workspace). Appropriate extension is added if missing.
- image: (optional) Input image to edit (relative path; PNG, JPG, JPEG, GIF, WEBP).

Example: Generating a sunset image
{ "prompt": "A beautiful sunset over mountains with vibrant orange and purple colors", "path": "images/sunset.png", "image": null }

Example: Editing an existing image
{ "prompt": "Transform this image into a watercolor painting style", "path": "images/watercolor-output.png", "image": "images/original-photo.jpg" }

Example: Upscaling and enhancing an image
{ "prompt": "Upscale this image to higher resolution, enhance details, improve clarity and sharpness while maintaining the original content and composition", "path": "images/enhanced-photo.png", "image": "images/low-res-photo.jpg" }`

const PROMPT_PARAMETER_DESCRIPTION = `Prompt describing image generation or edits`

const PATH_PARAMETER_DESCRIPTION = `Relative path to save the resulting image`

const IMAGE_PARAMETER_DESCRIPTION = `Optional relative path to an input image to edit (PNG, JPG, JPEG, GIF, WEBP)`

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
