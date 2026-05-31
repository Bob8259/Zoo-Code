# Q Code

> Your AI-Powered Dev Team, Right in Your Editor — Engineered for Precision and Simplicity.

Q Code is a fork of [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code) (to whom we give deep credit and gratitude for their incredible community-driven contributions continuing the Roo Code lineage).

## The Q Code Philosophy: "Less is More"

The core concept driving **Q Code** is **"less is more"**. Rather than overloading the model with excessive prompt noise, context bloat, and automated IDE logs that lead to confusion, Q Code focuses on minimal, highly precise prompt engineering. This significantly **reduces agent hallucinations** and improves execution accuracy.

### Key Enhancements

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

---

## Local Setup & Development

1. **Clone** the repo:

    ```sh
    git clone https://github.com/zoo-code-alt-Org/zoo-code-alt.git
    ```

2. **Install dependencies**:

    ```sh
    pnpm install
    ```

3. **Run the extension**:
   Press `F5` (or go to **Run** → **Start Debugging**) in VSCode. This will open a new VSCode window with the Q Code extension running.

---

## License

[Apache 2.0 © 2026 Q Code Org](./LICENSE)
