import type OpenAI from "openai"

/**
 * Native tool definition for read_command_output.
 *
 * This tool allows the LLM to retrieve full command output that was truncated
 * during execute_command. When command output exceeds the preview threshold,
 * the full output is persisted to disk and an artifact_id is provided. The
 * LLM can then use this tool to read the full content or search within it.
 */

const READ_COMMAND_OUTPUT_DESCRIPTION = `Retrieve full output from a truncated execute_command result (marked as "[OUTPUT TRUNCATED - Full output saved to artifact: cmd-XXXX.txt]").

Supports two modes:
- Read mode: Sequential reading starting from a byte offset.
- Search mode: Filtering lines matching a case-insensitive regex or literal pattern.

Parameters:
- artifact_id: (required) The command output filename (e.g. "cmd-1706119234567.txt").
- search: (optional) Regex/literal filter. Omit entirely if not filtering (do not pass null/empty string).
- offset: (optional) Starting byte offset (default 0).
- limit: (optional) Max bytes to return (default 40KB).

Example: Reading truncated command output
{ "artifact_id": "cmd-1706119234567.txt" }

Example: Reading with pagination (after first 40KB)
{ "artifact_id": "cmd-1706119234567.txt", "offset": 40960 }

Example: Searching for errors in build output
{ "artifact_id": "cmd-1706119234567.txt", "search": "error|failed|Error" }

Example: Finding specific test failures
{ "artifact_id": "cmd-1706119234567.txt", "search": "FAIL" }`

const ARTIFACT_ID_DESCRIPTION = `Command output filename (e.g. "cmd-1706119234567.txt")`

const SEARCH_DESCRIPTION = `Optional case-insensitive regex/literal filter. Omit if not searching (do not pass null or empty string)`

const OFFSET_DESCRIPTION = `Starting byte offset (default: 0, for pagination)`

const LIMIT_DESCRIPTION = `Maximum bytes to return (default: 40KB)`

export default {
	type: "function",
	function: {
		name: "read_command_output",
		description: READ_COMMAND_OUTPUT_DESCRIPTION,
		// Note: strict mode is intentionally disabled for this tool.
		// With strict: true, OpenAI requires ALL properties to be in the 'required' array,
		// which forces the LLM to always provide explicit values (even null) for optional params.
		// This creates verbose tool calls and poor UX. By disabling strict mode, the LLM can
		// omit optional parameters entirely, making the tool easier to use.
		parameters: {
			type: "object",
			properties: {
				artifact_id: {
					type: "string",
					description: ARTIFACT_ID_DESCRIPTION,
				},
				search: {
					type: "string",
					description: SEARCH_DESCRIPTION,
				},
				offset: {
					type: "number",
					description: OFFSET_DESCRIPTION,
				},
				limit: {
					type: "number",
					description: LIMIT_DESCRIPTION,
				},
			},
			required: ["artifact_id"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
