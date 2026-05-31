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

		it("should resolve dynamic parameters and split prompt newlines into arrays", async () => {
			mockApiHandler.getModel.mockReturnValue({
				id: "mock-deepseek",
				temperature: 0.7,
				maxTokens: 4000,
				reasoningBudget: 2000,
				reasoningEffort: "xhigh",
			})

			mockTask.clineMessages = [
				{ type: "say", say: "text", text: "try to check the git status." },
				{ type: "say", say: "completion_result", text: "Checked status." },
			]

			const result = await CommandReviewService.reviewCommand("git status", "/mock/workspace", mockTask as Task)
			expect(result.approved).toBe("Yes")

			const lastPrompt = CommandReviewService.lastReviewPrompt
			expect(lastPrompt).toBeDefined()
			const parsed = JSON.parse(lastPrompt!)
			expect(parsed.modelId).toBe("mock-deepseek")
			expect(parsed.temperature).toBe(0.7)
			expect(parsed.maxTokens).toBe(4000)
			expect(parsed.maxThinkingTokens).toBe(2000)
			expect(parsed.reasoningEffort).toBe("xhigh")
			expect(Array.isArray(parsed.systemPrompt)).toBe(true)
			expect(parsed.systemPrompt[0]).toBe(
				"You are a command-line safety and security review agent. Respond strictly in the specified JSON format.",
			)
			expect(Array.isArray(parsed.messages[0].content)).toBe(true)

			// Assert history JSON array is embedded inside message content
			const contentStr = parsed.messages[0].content.join("\n")
			expect(contentStr).toContain('"role": "user"')
			expect(contentStr).toContain('"content": "try to check the git status."')
			expect(contentStr).toContain('"role": "assistant"')
			expect(contentStr).toContain('"content": "Checked status."')

			// Assert safety criteria appear at the start (before Proposed Command)
			const safetyIdx = contentStr.indexOf("Evaluate commands against these safety criteria:")
			const commandIdx = contentStr.indexOf("Proposed Command:")
			expect(safetyIdx).toBeGreaterThan(-1)
			expect(safetyIdx).toBeLessThan(commandIdx)

			// Assert safety criteria are repeated at the end (before response format)
			expect(contentStr).toContain("Remember the safety criteria above")
			const rememberIdx = contentStr.indexOf("Remember the safety criteria above")
			const formatIdx = contentStr.indexOf("Respond strictly in the following JSON format:")
			expect(rememberIdx).toBeLessThan(formatIdx)

			// Assert chat history label says 10 messages
			expect(contentStr).toContain("Recent Chat History (Last 10 messages)")
		})

		it("should use the most recent user_feedback message as userQuery", async () => {
			mockTask.clineMessages = [
				{ type: "say", say: "user_feedback", text: "First user message about setup." },
				{ type: "say", say: "text", text: "Okay, I will set up the project." },
				{ type: "say", say: "user_feedback", text: "Now run the tests please." },
				{ type: "say", say: "text", text: "Running tests..." },
			]

			const result = await CommandReviewService.reviewCommand("npm test", "/mock/workspace", mockTask as Task)
			expect(result.approved).toBe("Yes")

			const lastPrompt = CommandReviewService.lastReviewPrompt
			expect(lastPrompt).toBeDefined()
			const parsed = JSON.parse(lastPrompt!)
			const contentStr = parsed.messages[0].content.join("\n")

			// Should contain the MOST RECENT user message
			expect(contentStr).toContain("Now run the tests please.")
			// Should NOT contain the first user message as the User Intent line
			const intentSection = contentStr.split("User Intent (Most Recent Query):")[1]?.split("\n")[1] || ""
			expect(intentSection).toContain("Now run the tests please.")
			expect(intentSection).not.toContain("First user message about setup.")
		})

		it("should include up to 10 recent chat messages in history", async () => {
			// Create 15 messages so the last 10 are selected
			const messages = Array.from({ length: 15 }, (_, i) => ({
				type: "say" as const,
				say: i % 2 === 0 ? "user_feedback" : "text",
				text: i % 2 === 0 ? `User message ${i}` : `Assistant response ${i}`,
			}))
			mockTask.clineMessages = messages

			const result = await CommandReviewService.reviewCommand("git status", "/mock/workspace", mockTask as Task)
			expect(result.approved).toBe("Yes")

			const lastPrompt = CommandReviewService.lastReviewPrompt
			expect(lastPrompt).toBeDefined()
			const parsed = JSON.parse(lastPrompt!)
			const contentStr = parsed.messages[0].content.join("\n")

			// Should contain messages from index 5-14 (last 10)
			expect(contentStr).toContain("User message 14")
			expect(contentStr).toContain("Assistant response 5")
			// Should NOT contain messages 0-4 (oldest 5)
			expect(contentStr).not.toContain("User message 0")
			expect(contentStr).not.toContain("User message 4")
		})

		it("should fallback to last message if no user_feedback exists", async () => {
			mockTask.clineMessages = [
				{ type: "say", say: "text", text: "Some assistant message." },
				{ type: "say", say: "completion_result", text: "Task completed." },
			]

			const result = await CommandReviewService.reviewCommand("git status", "/mock/workspace", mockTask as Task)
			expect(result.approved).toBe("Yes")

			const lastPrompt = CommandReviewService.lastReviewPrompt
			expect(lastPrompt).toBeDefined()
			const parsed = JSON.parse(lastPrompt!)
			const contentStr = parsed.messages[0].content.join("\n")

			// The fallback should use the last message in clineMessages
			expect(contentStr).toContain("Task completed.")
		})
	})
})
