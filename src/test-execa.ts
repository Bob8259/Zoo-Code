import { execa } from "execa"

async function main() {
	const command = "node --version"
	try {
		console.log("Running execa with template literal...")
		const { stdout } = await execa({
			shell: true,
			stdin: "ignore",
		})`${command}`
		console.log("Success:", stdout)
	} catch (err) {
		console.error("Error:", err)
	}
}

main()
