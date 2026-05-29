# Q Code

> Your AI-Powered Dev Team, Right in Your Editor — Engineered for Precision and Simplicity.

Q Code is a fork of [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code) (to whom we give deep credit and gratitude for their incredible community-driven contributions continuing the Roo Code lineage).

## The Q Code Philosophy: "Less is More"

The core concept driving **Q Code** is **"less is more"**. Rather than overloading the model with excessive prompt noise, context bloat, and automated IDE logs that lead to confusion, Q Code focuses on minimal, highly precise prompt engineering. This significantly **reduces agent hallucinations** and improves execution accuracy.

### Key Enhancements

1. **Quick Mode Switch Shortcut (`Alt+Q`)**: Fast transition between **Code mode** and **Architecture mode** using a simple keyboard shortcut.
2. **Simplified Prompts**: Highly optimized and simplified system prompts for tools and modes, giving the agent clear guidance and removing prompt clutter.
3. **Removed Environment Details Context**: Completely stripped out the automated `<environment_details>` XML block (open tabs, terminal output checks, file listing trees, etc.) from the conversation loop. This avoids initial latency, saves substantial API tokens, and keeps the agent focused entirely on the relevant task workspace files.
4. **Structured Markdown Context Compaction**: Replaced the verbose legacy XML-wrapped context summarization format with a concise, highly structured 7-section Markdown compaction format. This drastically reduces prompt overhead and keeps goals, constraints, progress, key decisions, and next steps perfectly synchronized. This compaction design is credited to and adapted from the elegant compaction methodology in [OpenCode](https://github.com/anomalyco/opencode).
5. **Gemini-Optimized Escape Parser**: Modified the escape parser to make it fully compatible and suitable for Gemini models.

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
