import os from "os"
import * as fs from "fs/promises"
import * as path from "path"
import { Task } from "../../core/task/Task"
import { buildApiHandler } from "../../api"
import { ProviderSettings, getModelId } from "@roo-code/types"
import { RooIgnoreController } from "../../core/ignore/RooIgnoreController"

export class CommandReviewService {
	static lastReviewPrompt?: string

	static readonly DEFAULT_SAFETY_PROMPT = `You are a command-line safety and security review agent. Your role is to analyze a proposed shell command and determine if it is safe and correct to execute.

Proposed Command:
\`{{command}}\`

Context:
1. **User Intent (Most Recent Query):**
   "{{userQuery}}"

2. **System Information:**
   - Operating System: {{os}}
   - Working Directory: {{cwd}}

3. **Current TODO List:**
   {{todoList}}

4. **Directory Structure (Depth up to 3):**
   {{directoryStructure}}

5. **File Contents (if applicable):**
   {{fileContents}}

6. **Recent Chat History (Last 5 messages):**
   {{chatHistory}}

Evaluate the command against the following safety criteria:
- **Destructive Actions:** Does the command perform dangerous deletions or modifications (e.g., rm -rf without backups, unintended deletes, formatting disks, or overwriting critical system/project resources)?
- **Data Exfiltration & Security:** Does the command attempt to send sensitive keys, passwords, credentials, or proprietary source code to external servers?
- **Unauthorized Network Access:** Does it start backdoors, open untrusted listening ports, or download unverified executable content from the internet?
- **Malicious Intent Detection:** Does the command attempt to execute actions completely unrelated or contrary to the user's query and intent?

Respond strictly in the following JSON format:
{
  "approved": "Yes" | "No" | "Unsure",
  "reason": "Clear explanation of why it was approved, rejected, or marked as unsure. If rejected or unsure, clearly specify the potential security/safety risk."
}`

	static async reviewCommand(
		command: string,
		cwd: string,
		task: Task,
	): Promise<{ approved: "Yes" | "No" | "Unsure"; reason: string }> {
		try {
			const provider = await task.providerRef.deref()
			const state = await provider?.getState()
			if (!state) {
				return { approved: "Unsure", reason: "Could not access extension state." }
			}

			// 1. Gather OS details
			const osInfo = `${os.platform()} ${os.release()} (${os.arch()})`

			// 2. Gather User Intent
			const userQuery =
				task.clineMessages.find((m) => m.type === "say" && m.say === "user_feedback")?.text ||
				task.clineMessages[0]?.text ||
				""

			// 3. Gather TODO list
			const todoList =
				task.todoList && task.todoList.length > 0
					? task.todoList
							.map((todo) => {
								const marker =
									todo.status === "completed" ? "x" : todo.status === "in_progress" ? "/" : " "
								return `- [${marker}] ${todo.content}`
							})
							.join("\n")
					: "(No active TODOs)"

			// 4. Gather Directory Tree up to Depth 3
			const treeLines = await this.buildDirectoryTree(cwd, cwd, 3, 1, task.rooIgnoreController)
			const directoryStructure = treeLines.join("\n") || "(Empty or inaccessible directory)"

			// 5. Gather file contents referenced in the command
			const fileContents = await this.gatherReferencedFileContents(command, cwd, task.rooIgnoreController)

			// 6. Gather recent 5 chat turns as a structured JSON array
			const filteredMessages = task.clineMessages.filter(
				(m) =>
					m.text &&
					!m.partial &&
					m.type === "say" &&
					(m.say === "text" ||
						m.say === "user_feedback" ||
						m.say === "error" ||
						m.say === "completion_result"),
			)

			const historyJson = filteredMessages.slice(-5).map((m) => {
				const role = m === task.clineMessages[0] || m.say === "user_feedback" ? "user" : "assistant"
				return {
					role,
					content: m.text || "",
				}
			})

			const chatHistory =
				historyJson.length > 0 ? JSON.stringify(historyJson, null, 2) : "(No prior conversation history)"

			// 7. Instantiate the configured API provider configuration
			let apiConfig: ProviderSettings = task.apiConfiguration
			const profileId = state.commandAutoReviewProfileId

			if (profileId && profileId !== "default" && profileId !== (apiConfig as any).id) {
				try {
					const profile = await provider?.providerSettingsManager.getProfile({ id: profileId })
					if (profile) {
						apiConfig = profile
					}
				} catch (e) {
					console.error("Failed to load command auto-review profile:", e)
				}
			}

			// 8. Construct Prompt Template
			const template = state.commandAutoReviewPrompt || this.DEFAULT_SAFETY_PROMPT
			const promptText = this.fillPromptTemplate(template, {
				command,
				userQuery,
				os: osInfo,
				cwd,
				todoList,
				directoryStructure,
				fileContents,
				chatHistory,
			})

			// 9. Call LLM
			const handler = buildApiHandler(apiConfig)

			// Resolve model parameters dynamically using getModel()
			let resolvedModel: any = null
			try {
				resolvedModel = handler.getModel()
			} catch (e) {
				console.error("Failed to call getModel on handler:", e)
			}

			const modelId =
				resolvedModel?.id ||
				getModelId(apiConfig) ||
				(apiConfig as any).modelId ||
				(apiConfig as any).openRouterModelId ||
				(apiConfig as any).openAiModelId ||
				(apiConfig as any).ollamaModelId ||
				(apiConfig as any).lmStudioModelId

			const temperature =
				resolvedModel?.temperature !== undefined
					? resolvedModel.temperature
					: (apiConfig.modelTemperature ?? null)
			const maxTokens =
				resolvedModel?.maxTokens !== undefined ? resolvedModel.maxTokens : (apiConfig.modelMaxTokens ?? null)
			const maxThinkingTokens =
				resolvedModel?.reasoningBudget !== undefined
					? resolvedModel.reasoningBudget
					: (apiConfig.modelMaxThinkingTokens ?? null)
			const reasoningEffort =
				resolvedModel?.reasoningEffort !== undefined
					? resolvedModel.reasoningEffort
					: (apiConfig.reasoningEffort ?? null)

			const systemPrompt =
				"You are a command-line safety and security review agent. Respond strictly in the specified JSON format."
			const messages = [{ role: "user" as const, content: promptText }]

			const formatMultiline = (text: any): any => {
				if (typeof text === "string") {
					return text.split(/\r?\n/)
				}
				return text
			}

			const formattedMessages = messages.map((msg) => ({
				...msg,
				content: formatMultiline(msg.content),
			}))

			// Save full request details as formatted JSON for debug inspection
			const requestPayload = {
				provider: apiConfig.apiProvider,
				modelId,
				temperature,
				maxTokens,
				maxThinkingTokens,
				reasoningEffort,
				systemPrompt: formatMultiline(systemPrompt),
				messages: formattedMessages,
				apiConfig: {
					...apiConfig,
					// Redact sensitive credentials to ensure safety
					apiKey: apiConfig.apiKey ? "******" : undefined,
					openAiApiKey: (apiConfig as any).openAiApiKey ? "******" : undefined,
					openRouterApiKey: (apiConfig as any).openRouterApiKey ? "******" : undefined,
					geminiApiKey: (apiConfig as any).geminiApiKey ? "******" : undefined,
					awsAccessKey: (apiConfig as any).awsAccessKey ? "******" : undefined,
					awsSecretKey: (apiConfig as any).awsSecretKey ? "******" : undefined,
					awsSessionToken: (apiConfig as any).awsSessionToken ? "******" : undefined,
					vertexJsonCredentials: (apiConfig as any).vertexJsonCredentials ? "******" : undefined,
					ollamaApiKey: (apiConfig as any).ollamaApiKey ? "******" : undefined,
					poeApiKey: (apiConfig as any).poeApiKey ? "******" : undefined,
					moonshotApiKey: (apiConfig as any).moonshotApiKey ? "******" : undefined,
					minimaxApiKey: (apiConfig as any).minimaxApiKey ? "******" : undefined,
					requestyApiKey: (apiConfig as any).requestyApiKey ? "******" : undefined,
					unboundApiKey: (apiConfig as any).unboundApiKey ? "******" : undefined,
					xaiApiKey: (apiConfig as any).xaiApiKey ? "******" : undefined,
					litellmApiKey: (apiConfig as any).litellmApiKey ? "******" : undefined,
					sambaNovaApiKey: (apiConfig as any).sambaNovaApiKey ? "******" : undefined,
					zaiApiKey: (apiConfig as any).zaiApiKey ? "******" : undefined,
					fireworksApiKey: (apiConfig as any).fireworksApiKey ? "******" : undefined,
					basetenApiKey: (apiConfig as any).basetenApiKey ? "******" : undefined,
					rooApiKey: (apiConfig as any).rooApiKey ? "******" : undefined,
					vercelAiGatewayApiKey: (apiConfig as any).vercelAiGatewayApiKey ? "******" : undefined,
				},
			}
			CommandReviewService.lastReviewPrompt = JSON.stringify(requestPayload, null, 2)

			const stream = handler.createMessage(systemPrompt, messages)
			let responseText = ""
			for await (const chunk of stream) {
				if (chunk.type === "text") {
					responseText += chunk.text
				} else if (chunk.type === "error") {
					throw new Error(chunk.message || chunk.error)
				}
			}

			// 10. Parse Response
			let jsonText = responseText.trim()
			const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/i)
			if (jsonMatch) {
				jsonText = jsonMatch[1].trim()
			}

			const parsed = JSON.parse(jsonText)
			if (
				parsed &&
				(parsed.approved === "Yes" || parsed.approved === "No" || parsed.approved === "Unsure") &&
				typeof parsed.reason === "string"
			) {
				return {
					approved: parsed.approved as "Yes" | "No" | "Unsure",
					reason: parsed.reason,
				}
			}

			throw new Error("Response JSON did not match expected safety schema.")
		} catch (error) {
			console.error("Command Auto-Review failed:", error)
			return {
				approved: "Unsure",
				reason: `Command Auto-Review failed with error: ${error instanceof Error ? error.message : String(error)}`,
			}
		}
	}

	private static fillPromptTemplate(template: string, replacements: Record<string, string>): string {
		let result = template
		for (const [key, value] of Object.entries(replacements)) {
			// Using split/join to replace all occurrences without regex escaping issues
			result = result.split(`{{${key}}}`).join(value)
		}
		return result
	}

	private static async buildDirectoryTree(
		dir: string,
		baseDir: string,
		maxDepth: number,
		currentDepth: number,
		rooIgnore?: RooIgnoreController,
	): Promise<string[]> {
		if (currentDepth > maxDepth) {
			return []
		}

		let entries: string[] = []
		try {
			const files = await fs.readdir(dir, { withFileTypes: true })
			for (const file of files) {
				const fullPath = path.join(dir, file.name)
				const relativePath = path.relative(baseDir, fullPath)

				if (rooIgnore && !rooIgnore.validateAccess(relativePath)) {
					continue
				}

				if (
					file.name === "node_modules" ||
					file.name === ".git" ||
					file.name === ".github" ||
					file.name === ".venv"
				) {
					continue
				}

				const indent = "  ".repeat(currentDepth - 1)
				if (file.isDirectory()) {
					entries.push(`${indent}[DIR] ${file.name}/`)
					const subEntries = await this.buildDirectoryTree(
						fullPath,
						baseDir,
						maxDepth,
						currentDepth + 1,
						rooIgnore,
					)
					entries.push(...subEntries)
				} else {
					entries.push(`${indent}${file.name}`)
				}
			}
		} catch (e) {
			// Ignore read errors
		}
		return entries
	}

	private static async gatherReferencedFileContents(
		command: string,
		cwd: string,
		rooIgnore?: RooIgnoreController,
	): Promise<string> {
		const matches =
			command.match(/[\w.\/-]+\.(?:js|ts|py|sh|bash|cmd|bat|ps1|rb|pl|go|json|yaml|yml|ini|conf|txt)\b/gi) || []
		const uniqueMatches = Array.from(new Set(matches))
		let fileContents = ""

		for (const match of uniqueMatches) {
			let resolvedPath = path.isAbsolute(match) ? match : path.resolve(cwd, match)
			const relativePath = path.relative(cwd, resolvedPath)
			if (rooIgnore && !rooIgnore.validateAccess(relativePath)) {
				continue
			}
			try {
				const stat = await fs.stat(resolvedPath)
				if (stat.isFile()) {
					let content = await fs.readFile(resolvedPath, "utf-8")
					if (content.length > 5000) {
						content = content.substring(0, 5000) + "\n... (truncated)"
					}
					fileContents += `\n--- File: ${match} ---\n${content}\n`
				}
			} catch (e) {
				// ignore
			}
		}

		return fileContents || "(No referenced file contents)"
	}
}
