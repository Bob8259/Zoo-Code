import { vitest, describe, it, expect, beforeEach } from "vitest"
import * as os from "os"
import * as fs from "fs/promises"
import * as path from "path"
import { CommandReviewService } from "../CommandReviewService"
import { Task } from "../../../core/task/Task"
import { buildApiHandler } from "../../../api"

// Mock the API handler
vitest.mock("../../../api", () => ({
	buildApiHandler: vitest.fn(),
}))

// Mock fs/promises
vitest.mock("fs/promises", () => ({
	default: {
		readdir: vitest.fn(),
		stat: vitest.fn(),
		readFile: vitest.fn(),
	},
	readdir: vitest.fn(),
	stat: vitest.fn(),
	readFile: vitest.fn(),
}))

describe("CommandReviewService", () => {
	let mockTask: any
	let mockApiHandler: any
	let mockStream: any

	beforeEach(() => {
		vitest.clearAllMocks()

		mockStream = {
			[Symbol.asyncIterator]: vitest.fn().mockImplementation(() => {
				let yielded = false
				return {
					next: async () => {
						if (!yielded) {
							yielded = true
							return {
								value: { type: "text", text: '{\n  "approved": "Yes",\n  "reason": "Safe to run"\n}' },
								done: false,
							}
						}
						return { value: undefined, done: true }
					},
				}
			}),
		}

		mockApiHandler = {
			createMessage: vitest.fn().mockReturnValue(mockStream),
			getModel: vitest.fn().mockReturnValue({ id: "mock-model" }),
		}
		;(buildApiHandler as any).mockReturnValue(mockApiHandler)

		mockTask = {
			taskId: "test-task-123",
			clineMessages: [{ type: "say", say: "user_feedback", text: "Please list files in workspace." }],
			todoList: [{ id: "1", content: "Implement command review", status: "in_progress" }],
			apiConfiguration: {
				apiProvider: "openai",
				apiModelId: "gpt-4",
				id: "default-config-id",
			},
			rooIgnoreController: {
				validateAccess: vitest.fn().mockReturnValue(true),
			},
			providerRef: {
				deref: vitest.fn().mockResolvedValue({
					getState: vitest.fn().mockResolvedValue({
						enableCommandAutoReview: true,
						commandAutoReviewProfileId: "default",
						commandAutoReviewPrompt: "",
					}),
					providerSettingsManager: {
						getProfile: vitest.fn().mockResolvedValue({
							apiProvider: "anthropic",
							apiModelId: "claude-3",
							id: "custom-profile-id",
						}),
					},
				}),
			},
			cwd: "/mock/workspace",
		}

		// Mock readdir to return empty array by default
		;(fs.readdir as any).mockResolvedValue([])
		;(fs.stat as any).mockResolvedValue({ isFile: () => true })
		;(fs.readFile as any).mockResolvedValue("")
	})

	describe("fillPromptTemplate", () => {
		it("should substitute placeholders correctly", () => {
			const template = "Command: {{command}}, CWD: {{cwd}}, OS: {{os}}"
			const filled = (CommandReviewService as any).fillPromptTemplate(template, {
				command: "git status",
				cwd: "/workspace",
				os: "darwin",
			})
			expect(filled).toBe("Command: git status, CWD: /workspace, OS: darwin")
			// Let's test with exact keys:
			const result = (CommandReviewService as any).fillPromptTemplate("Command is {{command}}", {
				command: "git status",
			})
			expect(result).toBe("Command is git status")
		})
	})

	describe("reviewCommand", () => {
		it("should automatically approve if LLM returns Yes", async () => {
			const result = await CommandReviewService.reviewCommand("git status", "/mock/workspace", mockTask as Task)
			expect(result).toEqual({
				approved: "Yes",
				reason: "Safe to run",
			})
			expect(buildApiHandler).toHaveBeenCalledWith(mockTask.apiConfiguration)
		})

		it("should load custom profile if configured", async () => {
			// Change profile ID in task provider state
			mockTask.providerRef.deref = vitest.fn().mockResolvedValue({
				getState: vitest.fn().mockResolvedValue({
					enableCommandAutoReview: true,
					commandAutoReviewProfileId: "custom-profile-id",
					commandAutoReviewPrompt: "",
				}),
				providerSettingsManager: {
					getProfile: vitest.fn().mockResolvedValue({
						apiProvider: "anthropic",
						apiModelId: "claude-3",
						id: "custom-profile-id",
					}),
				},
			})

			const result = await CommandReviewService.reviewCommand("git status", "/mock/workspace", mockTask as Task)
			expect(result.approved).toBe("Yes")
			expect(buildApiHandler).toHaveBeenCalledWith({
				apiProvider: "anthropic",
				apiModelId: "claude-3",
				id: "custom-profile-id",
			})
		})

		it("should handle destructive command rejection (No)", async () => {
			mockStream[Symbol.asyncIterator] = vitest.fn().mockImplementation(() => {
				let yielded = false
				return {
					next: async () => {
						if (!yielded) {
							yielded = true
							return {
								value: {
									type: "text",
									text: '{"approved": "No", "reason": "Destructive deletion detected"}',
								},
								done: false,
							}
						}
						return { value: undefined, done: true }
					},
				}
			})

			const result = await CommandReviewService.reviewCommand("rm -rf /", "/mock/workspace", mockTask as Task)
			expect(result).toEqual({
				approved: "No",
				reason: "Destructive deletion detected",
			})
		})

		it("should fallback to Unsure on invalid JSON response", async () => {
			mockStream[Symbol.asyncIterator] = vitest.fn().mockImplementation(() => {
				let yielded = false
				return {
					next: async () => {
						if (!yielded) {
							yielded = true
							return {
								value: { type: "text", text: "This is not a JSON block" },
								done: false,
							}
						}
						return { value: undefined, done: true }
					},
				}
			})

			const result = await CommandReviewService.reviewCommand("npm test", "/mock/workspace", mockTask as Task)
			expect(result.approved).toBe("Unsure")
			expect(result.reason).toContain("Command Auto-Review failed with error")
		})
	})
})
