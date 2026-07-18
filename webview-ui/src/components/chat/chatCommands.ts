import type { Command } from "@roo-code/types"

export const CONDENSE_COMMAND_NAME = "condense"
export const CONDENSE_COMMAND_TRIGGER = `/${CONDENSE_COMMAND_NAME}`

export const CONDENSE_COMMAND: Command = {
	name: CONDENSE_COMMAND_NAME,
	source: "built-in",
	filePath: `<built-in:${CONDENSE_COMMAND_NAME}>`,
	description: "Condense the current conversation context",
}

export function isCondenseCommand(text: string): boolean {
	return text.trim().toLowerCase() === CONDENSE_COMMAND_TRIGGER
}
