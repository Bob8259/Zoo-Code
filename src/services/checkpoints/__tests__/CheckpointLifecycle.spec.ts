import { CheckpointLifecycle } from "../CheckpointLifecycle"

function deferred() {
	let resolve!: () => void
	const promise = new Promise<void>((done) => {
		resolve = done
	})
	return { promise, resolve }
}

describe("CheckpointLifecycle", () => {
	it("waits for cancelled work to exit before another task starts Git", async () => {
		const parent = new CheckpointLifecycle()
		const child = new CheckpointLifecycle()
		const started = deferred()
		const exited = deferred()
		const parentWork = parent.run(async () => {
			started.resolve()
			await exited.promise
		})
		const rejection = expect(parentWork).rejects.toThrow()
		await started.promise
		const stopped = parent.dispose()
		const childCommand = vi.fn().mockResolvedValue("child")
		const childWork = child.run(childCommand)
		await Promise.resolve()
		expect(parent.signal.aborted).toBe(true)
		expect(childCommand).not.toHaveBeenCalled()
		exited.resolve()
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

	it("keeps the shared queue usable after a Git failure", async () => {
		const task = new CheckpointLifecycle()
		await expect(
			task.run(async () => {
				throw new Error("Git failed")
			}),
		).rejects.toThrow("Git failed")
		expect(await task.run(async () => "recovered")).toBe("recovered")
	})
})
