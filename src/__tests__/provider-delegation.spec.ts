// npx vitest run __tests__/provider-delegation.spec.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { RooCodeEventName } from "@roo-code/types"
import { ClineProvider } from "../core/webview/ClineProvider"

describe("ClineProvider.delegateParentAndOpenChild()", () => {
	it("persists parent delegation metadata and emits TaskDelegated", async () => {
		const providerEmit = vi.fn()
		const parentTask = { taskId: "parent-1", emit: vi.fn() } as any

		const childStart = vi.fn()
		const updateTaskHistory = vi.fn()
		const removeClineFromStack = vi.fn().mockResolvedValue(undefined)
		const createTask = vi.fn().mockResolvedValue({ taskId: "child-1", start: childStart })
		const handleModeSwitch = vi.fn().mockResolvedValue(undefined)
		const getTaskWithId = vi.fn().mockImplementation(async (id: string) => {
			if (id === "parent-1") {
				return {
					historyItem: {
						id: "parent-1",
						task: "Parent",
						tokensIn: 0,
						tokensOut: 0,
						totalCost: 0,
						childIds: [],
					},
				}
			}
			// child-1
			return {
				historyItem: {
					id: "child-1",
					task: "Do something",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
				},
			}
		})

		const provider = {
			emit: providerEmit,
			getCurrentTask: vi.fn(() => parentTask),
			removeClineFromStack,
			createTask,
			getTaskWithId,
			updateTaskHistory,
			handleModeSwitch,
			activateSubtaskProfileIfConfigured: vi.fn().mockResolvedValue(undefined),
			log: vi.fn(),
		} as unknown as ClineProvider

		const params = {
			parentTaskId: "parent-1",
			message: "Do something",
			initialTodos: [],
			mode: "code",
		}

		const child = await (ClineProvider.prototype as any).delegateParentAndOpenChild.call(provider, params)

		expect(child.taskId).toBe("child-1")

		// Invariant: parent closed before child creation
		expect(removeClineFromStack).toHaveBeenCalledTimes(1)
		// Child task is created with startTask: false and initialStatus: "active"
		expect(createTask).toHaveBeenCalledWith("Do something", undefined, parentTask, {
			initialTodos: [],
			initialStatus: "active",
			startTask: false,
		})

		// Metadata persistence - parent gets "delegated" status (child status is set at creation via initialStatus)
		expect(updateTaskHistory).toHaveBeenCalledTimes(1)

		// Parent set to "delegated"
		const parentSaved = updateTaskHistory.mock.calls[0][0]
		expect(parentSaved).toEqual(
			expect.objectContaining({
				id: "parent-1",
				status: "delegated",
				delegatedToId: "child-1",
				awaitingChildId: "child-1",
				childIds: expect.arrayContaining(["child-1"]),
			}),
		)

		// child.start() must be called AFTER parent metadata is persisted
		expect(childStart).toHaveBeenCalledTimes(1)

		// Event emission (provider-level)
		expect(providerEmit).toHaveBeenCalledWith(RooCodeEventName.TaskDelegated, "parent-1", "child-1")

		// Mode switch
		expect(handleModeSwitch).toHaveBeenCalledWith("code")
	})

	it("calls child.start() only after parent metadata is persisted (no race condition)", async () => {
		const callOrder: string[] = []

		const parentTask = { taskId: "parent-1", emit: vi.fn() } as any
		const childStart = vi.fn(() => callOrder.push("child.start"))

		const updateTaskHistory = vi.fn(async () => {
			callOrder.push("updateTaskHistory")
		})
		const removeClineFromStack = vi.fn().mockResolvedValue(undefined)
		const createTask = vi.fn(async () => {
			callOrder.push("createTask")
			return { taskId: "child-1", start: childStart }
		})
		const handleModeSwitch = vi.fn().mockResolvedValue(undefined)
		const getTaskWithId = vi.fn().mockResolvedValue({
			historyItem: {
				id: "parent-1",
				task: "Parent",
				tokensIn: 0,
				tokensOut: 0,
				totalCost: 0,
				childIds: [],
			},
		})

		const provider = {
			emit: vi.fn(),
			getCurrentTask: vi.fn(() => parentTask),
			removeClineFromStack,
			createTask,
			getTaskWithId,
			updateTaskHistory,
			handleModeSwitch,
			activateSubtaskProfileIfConfigured: vi.fn().mockResolvedValue(undefined),
			log: vi.fn(),
		} as unknown as ClineProvider

		await (ClineProvider.prototype as any).delegateParentAndOpenChild.call(provider, {
			parentTaskId: "parent-1",
			message: "Do something",
			initialTodos: [],
			mode: "code",
		})

		// Verify ordering: createTask → updateTaskHistory → child.start
		expect(callOrder).toEqual(["createTask", "updateTaskHistory", "child.start"])
	})

	it("activates configured subtask profile and persists apiConfigName on child history", async () => {
		const parentTask = { taskId: "parent-1", emit: vi.fn() } as any
		const childSetTaskApiConfigName = vi.fn()
		const childStart = vi.fn()
		const updateTaskHistory = vi.fn()
		const activateSubtaskProfileIfConfigured = vi.fn().mockResolvedValue("fast-model")
		const removeClineFromStack = vi.fn().mockResolvedValue(undefined)
		const createTask = vi.fn().mockResolvedValue({
			taskId: "child-1",
			start: childStart,
			setTaskApiConfigName: childSetTaskApiConfigName,
		})
		const handleModeSwitch = vi.fn().mockResolvedValue(undefined)
		const getTaskWithId = vi.fn().mockImplementation(async (id: string) => {
			if (id === "parent-1") {
				return {
					historyItem: {
						id: "parent-1",
						task: "Parent",
						tokensIn: 0,
						tokensOut: 0,
						totalCost: 0,
						childIds: [],
					},
				}
			}

			return {
				historyItem: {
					id: "child-1",
					task: "Explore codebase",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
				},
			}
		})

		const provider = {
			emit: vi.fn(),
			getCurrentTask: vi.fn(() => parentTask),
			removeClineFromStack,
			createTask,
			getTaskWithId,
			updateTaskHistory,
			handleModeSwitch,
			activateSubtaskProfileIfConfigured,
			log: vi.fn(),
		} as unknown as ClineProvider

		await (ClineProvider.prototype as any).delegateParentAndOpenChild.call(provider, {
			parentTaskId: "parent-1",
			message: "Explore codebase",
			initialTodos: [],
			mode: "ask",
		})

		expect(activateSubtaskProfileIfConfigured).toHaveBeenCalledTimes(1)
		expect(childSetTaskApiConfigName).toHaveBeenCalledWith("fast-model")

		const childHistoryUpdate = updateTaskHistory.mock.calls.find(
			([item]) => item.id === "child-1" && item.apiConfigName === "fast-model",
		)
		expect(childHistoryUpdate).toBeDefined()
	})

	it("skips subtask profile persistence when no subtask profile is configured", async () => {
		const parentTask = { taskId: "parent-1", emit: vi.fn() } as any
		const childSetTaskApiConfigName = vi.fn()
		const updateTaskHistory = vi.fn()
		const activateSubtaskProfileIfConfigured = vi.fn().mockResolvedValue(undefined)
		const removeClineFromStack = vi.fn().mockResolvedValue(undefined)
		const createTask = vi.fn().mockResolvedValue({
			taskId: "child-1",
			start: vi.fn(),
			setTaskApiConfigName: childSetTaskApiConfigName,
		})
		const handleModeSwitch = vi.fn().mockResolvedValue(undefined)
		const getTaskWithId = vi.fn().mockResolvedValue({
			historyItem: {
				id: "parent-1",
				task: "Parent",
				tokensIn: 0,
				tokensOut: 0,
				totalCost: 0,
				childIds: [],
			},
		})

		const provider = {
			emit: vi.fn(),
			getCurrentTask: vi.fn(() => parentTask),
			removeClineFromStack,
			createTask,
			getTaskWithId,
			updateTaskHistory,
			handleModeSwitch,
			activateSubtaskProfileIfConfigured,
			log: vi.fn(),
		} as unknown as ClineProvider

		await (ClineProvider.prototype as any).delegateParentAndOpenChild.call(provider, {
			parentTaskId: "parent-1",
			message: "Do something",
			initialTodos: [],
			mode: "code",
		})

		expect(activateSubtaskProfileIfConfigured).toHaveBeenCalledTimes(1)
		expect(childSetTaskApiConfigName).not.toHaveBeenCalled()
		expect(updateTaskHistory.mock.calls.some(([item]) => item.apiConfigName)).toBe(false)
	})
})

describe("ClineProvider.activateSubtaskProfileIfConfigured()", () => {
	const originalCliRuntime = process.env.ROO_CLI_RUNTIME

	beforeEach(() => {
		delete process.env.ROO_CLI_RUNTIME
	})

	afterEach(() => {
		if (originalCliRuntime === undefined) {
			delete process.env.ROO_CLI_RUNTIME
		} else {
			process.env.ROO_CLI_RUNTIME = originalCliRuntime
		}
	})

	it("returns undefined when subtask profile is default", async () => {
		const provider = {
			getState: vi.fn().mockResolvedValue({ subtaskApiConfigProfileId: "default" }),
			log: vi.fn(),
		} as unknown as ClineProvider

		const result = await (ClineProvider.prototype as any).activateSubtaskProfileIfConfigured.call(provider)

		expect(result).toBeUndefined()
	})

	it("activates configured subtask profile and returns profile name", async () => {
		const activateProviderProfile = vi.fn().mockResolvedValue(undefined)
		const provider = {
			getState: vi.fn().mockResolvedValue({ subtaskApiConfigProfileId: "profile-2" }),
			providerSettingsManager: {
				listConfig: vi.fn().mockResolvedValue([
					{ id: "profile-2", name: "fast-model", apiProvider: "anthropic" },
				]),
				getProfile: vi.fn().mockResolvedValue({ apiProvider: "anthropic" }),
			},
			activateProviderProfile,
			log: vi.fn(),
		} as unknown as ClineProvider

		const result = await (ClineProvider.prototype as any).activateSubtaskProfileIfConfigured.call(provider)

		expect(result).toBe("fast-model")
		expect(activateProviderProfile).toHaveBeenCalledWith(
			{ id: "profile-2" },
			{ persistModeConfig: false, persistTaskHistory: false },
		)
	})

	it("falls back when configured profile id is missing", async () => {
		const activateProviderProfile = vi.fn()
		const provider = {
			getState: vi.fn().mockResolvedValue({ subtaskApiConfigProfileId: "missing-profile" }),
			providerSettingsManager: {
				listConfig: vi.fn().mockResolvedValue([{ id: "profile-1", name: "default-profile" }]),
			},
			activateProviderProfile,
			log: vi.fn(),
		} as unknown as ClineProvider

		const result = await (ClineProvider.prototype as any).activateSubtaskProfileIfConfigured.call(provider)

		expect(result).toBeUndefined()
		expect(activateProviderProfile).not.toHaveBeenCalled()
	})

	it("skips activation in CLI runtime", async () => {
		process.env.ROO_CLI_RUNTIME = "1"

		const provider = {
			getState: vi.fn(),
			log: vi.fn(),
		} as unknown as ClineProvider

		const result = await (ClineProvider.prototype as any).activateSubtaskProfileIfConfigured.call(provider)

		expect(result).toBeUndefined()
		expect(provider.getState).not.toHaveBeenCalled()
	})
})
