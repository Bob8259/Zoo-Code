import { getEnvironmentDetails } from "../getEnvironmentDetails"
import { Task } from "../../task/Task"
import { RooIgnoreController } from "../../ignore/RooIgnoreController"

let mockActiveTextEditor: any = undefined

vi.mock("vscode", () => ({
	window: {
		get activeTextEditor() {
			return mockActiveTextEditor
		},
	},
}))

describe("getEnvironmentDetails", () => {
	const mockCwd = "/test/workspace"
	let mockCline: Partial<Task>

	beforeEach(() => {
		mockActiveTextEditor = undefined
		mockCline = {
			cwd: mockCwd,
			rooIgnoreController: undefined,
		}
	})

	it("should return empty environment details when no active file is open", async () => {
		const result = await getEnvironmentDetails(mockCline as Task)
		expect(result).toBe("<environment_details>\n\n</environment_details>")
	})

	it("should include active file path as relative POSIX path", async () => {
		mockActiveTextEditor = {
			document: {
				uri: {
					fsPath: "/test/workspace/src/components/Button.tsx",
				},
			},
		}

		const result = await getEnvironmentDetails(mockCline as Task)
		expect(result).toBe(
			"<environment_details>\n# VSCode Active File\nsrc/components/Button.tsx\n</environment_details>",
		)
	})

	it("should filter active file path through rooIgnoreController if present", async () => {
		mockActiveTextEditor = {
			document: {
				uri: {
					fsPath: "/test/workspace/ignored-file.tmp",
				},
			},
		}

		const filterPathsMock = vi.fn().mockImplementation((paths: string[]) => {
			return paths.includes("ignored-file.tmp") ? "" : paths.join("\n")
		})

		mockCline.rooIgnoreController = {
			filterPaths: filterPathsMock,
		} as unknown as RooIgnoreController

		const result = await getEnvironmentDetails(mockCline as Task)
		expect(filterPathsMock).toHaveBeenCalledWith(["ignored-file.tmp"])
		expect(result).toBe("<environment_details>\n\n</environment_details>")
	})

	it("should include active file if rooIgnoreController does not filter it", async () => {
		mockActiveTextEditor = {
			document: {
				uri: {
					fsPath: "/test/workspace/src/App.tsx",
				},
			},
		}

		const filterPathsMock = vi.fn().mockImplementation((paths: string[]) => {
			return paths.join("\n")
		})

		mockCline.rooIgnoreController = {
			filterPaths: filterPathsMock,
		} as unknown as RooIgnoreController

		const result = await getEnvironmentDetails(mockCline as Task)
		expect(filterPathsMock).toHaveBeenCalledWith(["src/App.tsx"])
		expect(result).toBe("<environment_details>\n# VSCode Active File\nsrc/App.tsx\n</environment_details>")
	})

	it("should handle error gracefully", async () => {
		// Cause an error by having document throw when accessing uri
		mockActiveTextEditor = {
			get document() {
				throw new Error("Simulated document read failure")
			},
		}

		const result = await getEnvironmentDetails(mockCline as Task)
		expect(result).toBe("<environment_details>\n(Error loading environment details)\n</environment_details>")
	})
})
