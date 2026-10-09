---
description: Solve the focused assignment block in staff-engineer voice
---

Solve the currently focused / selected block in
`Logistics_Operations_RAG_Assistant_Starter.ipynb`.

Follow the project skill **solve-notebook-block** (read
`.cursor/skills/solve-notebook-block/SKILL.md` and `voice.md` first).

Rules for this run:
- Edit the local notebook only. Do not use Colab MCP. Do not add CUDA, MPS, or other device setup.
- Run code with the project Poetry `.venv` (kernel **Assignment05 (.venv)**).
- Fill only this block. Keep the cell's hint comment. Leave other stubs and all instruction markdown alone.
- Derive the solution from the markdown brief above the cell and the fixed spec in the skill (800/120 chunks, MiniLM-L6-v2, Chroma `logistics_rag`, k=4, Ollama `llama3.2:3b`, temperature 0).
- Original work. No web or GitHub solution dumps.
- Write like a staff SWE with 14+ years experience: competent, terse, no AI/tutorial tone.
- **Keyboard characters only** in anything you write into the notebook. No emoji, smart quotes, em/en dashes, or arrows.
- Conclusion prose (section 4 only): first person or impersonal - never "you"/"your".
- **Do not ask** keep/discard/confirm.
- After the block is filled, commit the notebook and push `main` to `origin`. Skip the commit only when the cell was left unchanged.
- Reply in 1-3 short lines: what changed (section and cell id), what to re-run, and the commit that was pushed.
