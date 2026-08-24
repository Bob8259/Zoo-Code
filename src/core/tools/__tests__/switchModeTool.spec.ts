// npx vitest core/tools/__tests__/switchModeTool.spec.ts

import type { AskApproval, HandleError, NativeToolArgs, ToolUse } from "../../../shared/tools"

vi.mock("../../../shared/modes", () => ({
	getModeBySlug: vi.fn(),
	defaultModeSlug: "ask",
}))

vi.mock("../../prompts/responses", () => ({
	formatResponse: {
		toolError: vi.fn((msg: string) => `Tool Error: ${msg}`),
	},
}))

vi.mock("delay", () => ({
	default: vi.fn(() => Promise.resolve()),
}))

const mockAskApproval = vi.fn<AskApproval>()
const mockHandleError = vi.fn<HandleError>()
const mockPushToolResult = vi.fn()
const mockRecordToolError = vi.fn()
const mockSayAndCreateMissingParamError = vi.fn()
const mockHandleModeSwitch = vi.fn()

const mockCline = {
	ask: vi.fn(),
	sayAndCreateMissingParamError: mockSayAndCreateMissingParamError,
	recordToolError: mockRecordToolError,
	consecutiveMistakeCount: 0,
	didToolFailInCurrentTurn: false,
	taskId: "mock-task-id",
	providerRef: {
		deref: vi.fn(() => ({
			getState: vi.fn(() => ({ customModes: [], mode: "ask" })),
			handleModeSwitch: mockHandleModeSwitch,
		})),
	},
}

import { switchModeTool } from "../SwitchModeTool"
import { getModeBySlug } from "../../../shared/modes"

const withNativeArgs = (block: ToolUse<"switch_mode">): ToolUse<"switch_mode"> => ({
	...block,
	nativeArgs: {
		mode_slug: block.params.mode_slug,
		reason: block.params.reason,
	} as unknown as NativeToolArgs["switch_mode"],
})

describe("switchModeTool", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockAskApproval.mockResolvedValue(true)
		vi.mocked(getModeBySlug).mockReturnValue({
			slug: "code",
			name: "Code",
			roleDefinition: "Test role definition",
			groups: ["command", "read", "edit"],
		})
		mockCline.consecutiveMistakeCount = 0
		mockCline.didToolFailInCurrentTurn = false
	})

	it("should reject switch_mode when running as a delegated subtask", async () => {
		const block: ToolUse<"switch_mode"> = {
			type: "tool_use",
			name: "switch_mode",
			params: {
				mode_slug: "code",
				reason: "Need to make edits",
			},
			partial: false,
		}

		const subtaskCline = { ...mockCline, parentTaskId: "parent-task-id" }

		await switchModeTool.handle(subtaskCline as any, withNativeArgs(block), {
			askApproval: mockAskApproval,
			handleError: mockHandleError,
			pushToolResult: mockPushToolResult,
		})

		expect(mockAskApproval).not.toHaveBeenCalled()
		expect(mockHandleModeSwitch).not.toHaveBeenCalled()
		expect(mockRecordToolError).toHaveBeenCalledWith("switch_mode")
		expect(subtaskCline.didToolFailInCurrentTurn).toBe(true)
		expect(mockPushToolResult).toHaveBeenCalledWith(
			expect.stringContaining("switch_mode is not available in delegated subtasks"),
		)
	})
})
