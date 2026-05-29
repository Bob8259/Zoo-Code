import * as path from "path"
import * as vscode from "vscode"
import { Task } from "../task/Task"
import "../../utils/path" // ensures String.prototype.toPosix is registered

export async function getEnvironmentDetails(cline: Task, includeFileDetails: boolean = false) {
	try {
		let details = ""

		const activeEditor = vscode.window.activeTextEditor
		const activeFile = activeEditor?.document?.uri?.fsPath

		if (activeFile) {
			const relativePath = path.relative(cline.cwd, activeFile).toPosix()
			const allowedFile = cline.rooIgnoreController
				? cline.rooIgnoreController.filterPaths([relativePath])
				: relativePath

			if (allowedFile) {
				details += `\n# VSCode Active File\n${allowedFile}`
			}
		}

		return `<environment_details>\n${details.trim()}\n</environment_details>`
	} catch (error) {
		console.error("Error in getEnvironmentDetails:", error)
		return `<environment_details>\n(Error loading environment details)\n</environment_details>`
	}
}
