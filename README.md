# Qoo Code

> Your AI-Powered Dev Team, Right in Your Editor — Engineered for Precision and Simplicity.

Qoo Code is a fork of [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code) (to whom we give deep credit and gratitude for their incredible community-driven contributions continuing the Roo Code lineage).

## Why "Qoo Code"?

The author keeps an eggplant plush toy on their desk. In Chinese, eggplant is **茄子** (_qié zi_); the first character **茄** starts with **Q** in pinyin. That little plush became the namesake for this extension: **Qoo Code**.

The name also honors the two extensions this project builds on: **[Roo Code](https://github.com/RooCodeInc/Roo-Code)** and **[Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code)**—keeping the **Q** lineage while carrying their ideas forward.

## The Qoo Code Philosophy: "Less is More"

The core concept driving **Qoo Code** is **"less is more"**. Rather than overloading the model with excessive prompt noise, context bloat, and automated IDE logs that lead to confusion, Qoo Code focuses on minimal, highly precise prompt engineering. This significantly **reduces agent hallucinations** and improves execution accuracy.

Qoo Code also gives **most controls to you**, the user. It does not try to guess every workflow or hide decisions behind opaque defaults. That means you should invest in a project-level **[AGENTS.md](./AGENTS.md)** (or equivalent agent rules file): write how you want the agent to behave, what to avoid, and how your repo is organized. The extension stays out of your way; **AGENTS.md** is how you steer it.

### Key Enhancements

Together, these changes aim to **improve the day-to-day user experience**, **raise safety** while preserving useful **autonomous** behavior (auto-approval where appropriate), **borrow proven ideas** from other projects where they fit, and support a **clearer, more efficient workflow** from exploration through implementation.

1. **Quick Mode Switch Shortcut (`Alt+Q`)**: Fast transition between **Code mode** and **Architecture mode** using a simple keyboard shortcut.
2. **Simplified Prompts**: Highly optimized and simplified system prompts for modes, giving the agent clear guidance and removing prompt clutter.
3. **Focused Environment Details Context**: Re-added a highly optimized `<environment_details>` XML block that ONLY includes the path to the currently active focused editor, injected exactly once at the start of each new conversation. This maintains minimal latency and saves API tokens while ensuring the agent always knows your starting active file.
4. **Structured Markdown Context Compaction**: Replaced the verbose legacy XML-wrapped context summarization format with a concise, highly structured 7-section Markdown compaction format. This drastically reduces prompt overhead and keeps goals, constraints, progress, key decisions, and next steps perfectly synchronized. This compaction design is credited to and adapted from the elegant compaction methodology in [OpenCode](https://github.com/anomalyco/opencode).
5. **Gemini-Optimized Escape Parser**: Modified the escape parser to make it fully compatible and suitable for Gemini models.
6. **Enriched Debug API History**: Clicking "Open API History" in task debug options now displays a comprehensive view including the full system prompt, tool definitions array, and conversation history, rather than just raw user/assistant messages.
7. **Optimized `apply_diff` Tool Instructions**: Streamlined tool prompts and parameter descriptions with explicit guidelines for prefix stripping (removing line-number prefixes like `:130 | `), indentation normalization (converting hidden non-breaking spaces), literal matching, and concrete examples (replacing confusing placeholders) to ensure extremely reliable search/replace applications.
8. **AI Command Auto-Review Guardrails**: Adds an intelligent, three-level safety filter for terminal commands before they are automatically executed:
    - **Level 1 (Explicit Lists):** Matches command prefixes against Allowed/Denied lists to bypass or reject execution instantly.
    - **Level 2 (Context-Aware Safety Review):** Gathers comprehensive environment state (User Intent, OS, CWD directory tree, referenced script contents, active TODOs, and recent chat history as a structured JSON array) and invokes a safety review LLM.
    - **Level 3 (Action Routing):** Automatically executes approved commands, or prompts the user with a manual approval dialog showing the detailed safety reasoning if rejected or unsure. Includes a developer debug action (shield icon) to inspect the fully-resolved LLM parameters and multiline prompt JSON arrays natively in VS Code.
9. **Redesigned Subtask Delegation**: Reworked subtask flow so the main agent can spawn focused child tasks via `new_task` for simple, self-contained work (file discovery, codebase search, structure inspection, read-only analysis). Configure a dedicated **Subtask model profile** in settings so subtasks run on a smaller, cheaper, or faster model while the parent keeps a stronger model for implementation—saving tokens and latency on trivial exploration without blocking the main task.

---

## Local Setup & Development

1. **Clone** the repo:

    ```sh
    git clone https://github.com/Bob8259/Zoo-Code.git
    ```

2. **Install dependencies**:

    ```sh
    pnpm install
    ```

3. **Run the extension**:
   Press `F5` (or go to **Run** → **Start Debugging**) in VSCode. This will open a new VSCode window with the Qoo Code extension running.

---

## Why Changes Are Not Submitted Upstream to Zoo Code

Qoo Code remains a **fork** rather than a stream of pull requests to [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code). That is intentional, for the reasons below.

1. **Breaking changes and different direction.** This fork introduces breaking changes and product choices (for example, simplified prompts, altered context compaction, and command auto-review behavior) that do not match Zoo Code’s current development plan or upstream API expectations. Merging them would require large, coordinated redesigns on the Zoo Code side—not small, drop-in patches.

2. **Upstream merge backlog.** Zoo Code already has a large backlog of open, unmerged pull requests. Adding another substantial PR from this fork would likely sit in that queue for a long time without realistic review bandwidth, which does not help either project.

3. **AI-assisted development without full review.** Most changes here were produced with AI assistance under tight time constraints. They were **not** run through the same human review cycle Zoo Code expects, and **automated tests were not run** before release. Upstreaming without that quality bar would be unfair to Zoo Code maintainers and to their users.

If you want these ideas in upstream Zoo Code, treat this repository as a **reference implementation** and cherry-pick or reimplement pieces deliberately—with tests and maintainer alignment—rather than expecting a direct merge of this branch.

---

## License

[Apache 2.0 © 2026 Qoo Code](./LICENSE)
