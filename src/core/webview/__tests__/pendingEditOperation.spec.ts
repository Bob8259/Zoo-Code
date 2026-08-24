import { describe, expect, it, vi } from "vitest"
import { processPendingEdit, type PendingEditTask } from "../pendingEditOperation"

describe("processPendingEdit", () => {
	it("submits the replacement when checkpoint restore already removed the original", async () => {
		const task: PendingEditTask = {
			clineMessages: [{ ts: 1, type: "say", say: "text", text: "Earlier" }],
			apiConversationHistory: [{ ts: 1, role: "user", content: [{ type: "text", text: "Earlier" }] }],
			overwriteClineMessages: vi.fn(async () => {}),
			overwriteApiConversationHistory: vi.fn(async () => {}),
			handleWebviewAskResponse: vi.fn(),
		}

		await processPendingEdit(task, {
			messageTs: 2,
			editedContent: "Replacement",
			images: ["image-data"],
		})

		expect(task.overwriteClineMessages).not.toHaveBeenCalled()
		expect(task.overwriteApiConversationHistory).not.toHaveBeenCalled()
		expect(task.handleWebviewAskResponse).toHaveBeenCalledWith("messageResponse", "Replacement", ["image-data"])
	})

	it("truncates a target that is still present before submitting the replacement", async () => {
		const task: PendingEditTask = {
			clineMessages: [
				{ ts: 1, type: "say", say: "text", text: "Earlier" },
				{ ts: 2, type: "say", say: "user_feedback", text: "Original" },
				{ ts: 3, type: "say", say: "text", text: "Response" },
			],
			apiConversationHistory: [
				{ ts: 1, role: "user", content: [{ type: "text", text: "Earlier" }] },
				{ ts: 2, role: "user", content: [{ type: "text", text: "Original" }] },
			],
			overwriteClineMessages: vi.fn(async () => {}),
			overwriteApiConversationHistory: vi.fn(async () => {}),
			handleWebviewAskResponse: vi.fn(),
		}

		await processPendingEdit(task, { messageTs: 2, editedContent: "Replacement" })

		expect(task.overwriteClineMessages).toHaveBeenCalledWith([task.clineMessages[0]])
		expect(task.overwriteApiConversationHistory).toHaveBeenCalledWith([task.apiConversationHistory[0]])
		expect(task.handleWebviewAskResponse).toHaveBeenCalledWith("messageResponse", "Replacement", undefined)
	})
})
