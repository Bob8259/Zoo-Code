import type OpenAI from "openai"

const apply_patch_DESCRIPTION = `Apply patches using a simplified, file-oriented diff format to add, delete, or update files.

Format:
*** Begin Patch
[ file sections ]
*** End Patch

Headers:
- *** Add File: <path> (followed by '+' lines for content)
- *** Delete File: <path>
- *** Update File: <path> (optionally followed by '*** Move to: <new path>' to rename)

For Update File hunks:
- Start with '@@' (optionally with a class/function name context).
- Prefix lines with ' ' (unchanged context), '-' (remove), or '+' (add).
- Include 3 lines of context above and below each change. Use nested '@@' if more context is needed.

Example patch:
*** Begin Patch
*** Add File: hello.txt
+Hello world
*** Update File: src/app.py
*** Move to: src/main.py
@@ def greet():
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
