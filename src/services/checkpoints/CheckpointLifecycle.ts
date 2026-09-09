/** Serializes checkpoint operations across task instances in this extension host. */
export class CheckpointLifecycle {
	private static queue: Promise<void> = Promise.resolve()
	private readonly controller = new AbortController()
	private pending: Promise<void> = Promise.resolve()

	get signal(): AbortSignal {
		return this.controller.signal
	}

	run<T>(operation: () => Promise<T>): Promise<T> {
		const result = CheckpointLifecycle.queue.then(async () => {
			this.signal.throwIfAborted()
			const value = await operation()
			this.signal.throwIfAborted()
			return value
		})
		// Keep the queue usable after failures, but do not release it until Git has exited.
		this.pending = CheckpointLifecycle.queue = result.then(
			() => {},
			() => {},
		)
		return result
	}

	dispose(): Promise<void> {
		this.controller.abort()
		return this.pending
	}
}
