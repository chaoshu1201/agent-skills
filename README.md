# Agent Skills

A category-organized collection of reusable skills for AI coding agents. Each skill lives in its own directory and contains the instructions, metadata, and supporting templates needed to use it.

## Install With the Vercel Skills CLI

The [Vercel Skills CLI](https://skills.sh/) installs skills from this GitHub repository into an agent's skills directory.

### Install the Existing Collection Globally

First inspect which skills the CLI discovers:

```bash
npx skills add chaoshu1201/agent-skills --list
```

For a predictable initial installation, explicitly select every discovered skill and the five harnesses covered by this guide:

```bash
npx skills add chaoshu1201/agent-skills \
  --skill '*' \
  -g \
  -a codex \
  -a claude-code \
  -a pi \
  -a antigravity \
  -a hermes-agent \
  -y
```

In default symlink mode, this creates the canonical runtime directories under:

```text
~/.agents/skills/<skill-name>/
```

Universal harnesses consume those directories directly. The CLI creates applicable per-skill links for non-universal harnesses, such as Claude Code, Pi, and Hermes.

If you want to install every discovered skill for every agent supported by the CLI, use:

```bash
npx skills add chaoshu1201/agent-skills --all -g
```

`--all` is intentionally broad: it implies all skills, all agents, and non-interactive confirmation. It is not the preferred command for a machine-specific profile.

Verify the result:

```bash
npx skills ls -g
```

## Skill Catalog

Skills are grouped by the first directory under [`skills/`](skills/). Browse the category that best matches the work you want to do, then open its `SKILL.md` for the complete operating instructions.

### `admin`

Administrative, planning, and operational workflows.

#### [Academic Trip Planner](skills/admin/academic-trip-planner/)

**What it does:** Researches and plans academic conferences, research visits, and other academic travel. It produces verified itinerary and budget packages, including flights, accommodation, registration fees, membership renewal comparisons, airport transfers, visa requirements, and interactive HTML budget applications.

**When to use it:** Use it when you need an end-to-end academic trip plan and the relevant event, travel, accommodation, membership, or visa details must be researched and checked against authoritative sources.

**How to use it:** Invoke it with `$academic-trip-planner` and provide the conference or event URL, origin or booking portal, travel dates, flight and accommodation preferences, membership status, nationality for visa research, and any budget constraints. The skill pauses for clarification when required information is missing or source data cannot be verified.

**Compatibility:** ChatGPT Desktop App.

```text
Please use the /academic-conference-planner skill to plan my trip and budget for ICML 2026 at https://icml.cc/Conferences/2026
```

### `knowledge`

Research, comparison, verification, and synthesis workflows.

#### [Fusion Chat Web](skills/knowledge/fusion-chat-web/)

**What it does:** Sends the same question to multiple already-open, authenticated web chat providers, preserves each response, checks disagreements, and synthesizes a verified union of the useful contributions.

**When to use it:** Use it when you want to compare, cross-check, fact-check, or adjudicate answers from ChatGPT, Claude, Gemini, Grok, DeepSeek, or other browser-based AI chats.

**How to use it:** Invoke it with `$fusion-chat-web` and provide the exact question, at least two labeled chat URLs, the main-agent model choice, and the worker model or approval for the lightweight default. The skill saves provider captures and the synthesized answer in a project-local run directory.

**Compatibility:** ChatGPT Desktop App.

```text
Use $fusion-chat-web to compare answers to this question:
[exact question]

Use these already-open, signed-in chat URLs:
- [provider/model]: [chat URL]
- [provider/model]: [chat URL]
```
