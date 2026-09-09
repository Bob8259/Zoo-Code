/** Serializes checkpoint operations for one task instance. */
export class CheckpointLifecycle {
	private readonly controller = new AbortController()
	private queue: Promise<void> = Promise.resolve()
	private pending: Promise<void> = Promise.resolve()

	get signal(): AbortSignal {
		return this.controller.signal
	}

	run<T>(operation: () => Promise<T>): Promise<T> {
		const result = this.queue.then(async () => {
			this.signal.throwIfAborted()
			const value = await operation()
			this.signal.throwIfAborted()
			return value
		})
		// Keep the queue usable after failures, but do not release it until Git has exited.
		this.pending = this.queue = result.then(
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
