import { execa } from "execa"

describe("Execa Literal Test", () => {
	it("tests execa template literal with shell true", async () => {
		const command = "node --version"
		try {
			const { stdout } = await execa({
				shell: true,
				stdin: "ignore",
			})`${command}`
			expect(stdout).toBe("FORCE_FAIL_TO_SEE_OUTPUT_" + stdout)
		} catch (err) {
			expect(err.message).toBe("FORCE_FAIL_TO_SEE_ERROR_" + err.message)
		}
	})
})
