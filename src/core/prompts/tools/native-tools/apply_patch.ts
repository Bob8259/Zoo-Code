import type OpenAI from "openai"

const apply_patch_DESCRIPTION = `Apply patches (create, delete, update, rename files). Format:
*** Begin Patch
*** Add File: hello.txt
+Hello world
*** Update File: src/app.py
*** Move to: src/main.py
@@ def greet()
-print("Hi")
+print("Hello, world!")
*** Delete File: obsolete.txt
*** End Patch`

const apply_patch = {
	type: "function",
	function: {
		name: "apply_patch",
		description: apply_patch_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				patch: {
					type: "string",
					description:
						"The complete patch text in the apply_patch format, starting with '*** Begin Patch' and ending with '*** End Patch'.",
				},
			},
			required: ["patch"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default apply_patch
