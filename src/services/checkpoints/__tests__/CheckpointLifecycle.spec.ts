import { CheckpointLifecycle } from "../CheckpointLifecycle"

function deferred() {
	let resolve!: () => void
	const promise = new Promise<void>((done) => {
		resolve = done
	})
	return { promise, resolve }
}

describe("CheckpointLifecycle", () => {
	it("does not block a subtask while its parent's cancelled Git work exits", async () => {
		const parent = new CheckpointLifecycle()
		const child = new CheckpointLifecycle()
		const parentStarted = deferred()
		const parentExited = deferred()
		const childStarted = deferred()
		const parentWork = parent.run(async () => {
			parentStarted.resolve()
			await parentExited.promise
		})
		const rejection = expect(parentWork).rejects.toThrow()
		await parentStarted.promise
		const stopped = parent.dispose()
		const childCommand = vi.fn().mockImplementation(async () => {
			childStarted.resolve()
			return "child"
		})
		const childWork = child.run(childCommand)
		await childStarted.promise
		expect(parent.signal.aborted).toBe(true)
		expect(childCommand).toHaveBeenCalledTimes(1)
		parentExited.resolve()
		await stopped
		await rejection
		expect(await childWork).toBe("child")
	})

	it("skips queued commands from a finished task and permits a fresh resumed instance", async () => {
		const oldTask = new CheckpointLifecycle()
		const command = vi.fn().mockResolvedValue(undefined)
		const queued = oldTask.run(command)
		const rejection = expect(queued).rejects.toThrow()
		await oldTask.dispose()
		await rejection
		expect(command).not.toHaveBeenCalled()
		const resumedTask = new CheckpointLifecycle()
		await resumedTask.run(command)
		expect(command).toHaveBeenCalledTimes(1)
	})

	it("keeps the task queue usable after a Git failure", async () => {
		const task = new CheckpointLifecycle()
		await expect(
			task.run(async () => {
				throw new Error("Git failed")
			}),
		).rejects.toThrow("Git failed")
		expect(await task.run(async () => "recovered")).toBe("recovered")
	})
})
