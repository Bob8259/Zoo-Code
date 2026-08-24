const ROOT_TASK_GUIDELINE_5 =
	"5. For simple, self-contained exploration before making changes (finding files, searching the codebase, inspecting structure), delegate with `new_task` in `ask` mode instead of doing extensive exploration in the parent task. Call `new_task` alone in its own turn."

const SUBTASK_GUIDELINE_5 =
	"5. You are a delegated subtask. Complete the assigned work directly with your available tools. Do not call `new_task`, `switch_mode`, or `ask_followup_question`. If the current mode cannot complete the work (for example you would need to switch modes or execute commands you cannot), call `task_completion` and report that limitation. Otherwise, when done, call `task_completion` with a concise summary for the parent."

export function getToolUseGuidelinesSection(options?: { isSubtask?: boolean }): string {
	const guideline5 = options?.isSubtask ? SUBTASK_GUIDELINE_5 : ROOT_TASK_GUIDELINE_5

	return `# Tool Use Guidelines

1. Assess what information you already have and what information you need to proceed with the task.
2. Choose the most appropriate tool based on the task and the tool descriptions provided. Assess if you need additional information to proceed, and which of the available tools would be most effective for gathering this information. For example using the list_files tool is more effective than running a command like \`ls\` in the terminal. It's critical that you think about each available tool and use the one that best fits the current step in the task.
3. If multiple actions are needed, you may use multiple tools in a single message when appropriate, or use tools iteratively across messages. Each tool use should be informed by the results of previous tool uses. Do not assume the outcome of any tool use. Each step must be informed by the previous step's result.
4. When the user's task is fully complete, you MUST call the task_completion tool to deliver the final result. Do not finish with a plain-text response alone.
${guideline5}

By carefully considering the user's response after tool executions, you can react accordingly and make informed decisions about how to proceed with the task. This iterative process helps ensure the overall success and accuracy of your work.`
}
