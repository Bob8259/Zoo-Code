import type OpenAI from "openai"
import { createReadFileTool } from "../read_file"

// Helper type to access function tools
type FunctionTool = OpenAI.Chat.ChatCompletionTool & { type: "function" }

// Helper to get function definition from tool
const getFunctionDef = (tool: OpenAI.Chat.ChatCompletionTool) => (tool as FunctionTool).function

describe("createReadFileTool", () => {
	describe("indentation mode", () => {
		it("should always include indentation mode in description", () => {
			const tool = createReadFileTool()
			const description = getFunctionDef(tool).description

			expect(description).toContain("indentation")
		})

		it("should always include indentation parameter in schema", () => {
			const tool = createReadFileTool()
			const schema = getFunctionDef(tool).parameters as any

			expect(schema.properties).toHaveProperty("indentation")
		})

		it("should include mode parameter in schema", () => {
			const tool = createReadFileTool()
			const schema = getFunctionDef(tool).parameters as any

			expect(schema.properties).toHaveProperty("mode")
			expect(schema.properties.mode.enum).toContain("slice")
			expect(schema.properties.mode.enum).toContain("indentation")
		})

		it("should include offset and limit parameters in schema", () => {
			const tool = createReadFileTool()
			const schema = getFunctionDef(tool).parameters as any

			expect(schema.properties).toHaveProperty("offset")
			expect(schema.properties).toHaveProperty("limit")
		})
	})

	describe("tool structure", () => {
		it("should have correct tool name", () => {
			const tool = createReadFileTool()

			expect(getFunctionDef(tool).name).toBe("read_file")
		})

		it("should be a function type tool", () => {
			const tool = createReadFileTool()

			expect(tool.type).toBe("function")
		})

		it("should have strict mode enabled", () => {
			const tool = createReadFileTool()

			expect(getFunctionDef(tool).strict).toBe(true)
		})

		it("should require path parameter", () => {
			const tool = createReadFileTool()
			const schema = getFunctionDef(tool).parameters as any

			expect(schema.required).toContain("path")
		})
	})
})
