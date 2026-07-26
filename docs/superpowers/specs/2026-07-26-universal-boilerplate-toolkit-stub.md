# Universal Boilerplate Toolkit — Future Spec Stub

**Date:** 2026-07-26
**Status:** Deferred (build after BSAM is complete)
**Prerequisite:** Complete BSAM development and populate `docs/findings/` with development insights.

---

## Vision

Create a set of Claude Code skills and/or MCP plugins that help AI agents discover, evaluate, and scaffold projects from existing boilerplates/frameworks — reducing token usage on repeatable code and letting the agent focus on core business logic.

Wasp is locked to React/Node.js/Prisma. The universal toolkit would be **framework-agnostic**: it would support registering boilerplates for any tech stack (Django, Rails, Laravel, Spring Boot, etc.) and provide a common interface for the agent to:

1. **Discover** — Search a registry of boilerplates by use-case (SaaS, booking, e-commerce, etc.)
2. **Evaluate** — Score a boilerplate's fit for the user's requirements (auth? payments? mobile-first?)
3. **Scaffold** — Run the boilerplate's CLI/setup, then hand off to the appropriate framework-specific skill
4. **Adapt** — Apply common modifications (swap DB, add auth provider, change styling)

## Inputs to Build From

After BSAM is complete, these findings files will exist in `docs/findings/`:

- `wasp-scaffolding-savings.md` — Concrete data on what Wasp saved
- `shadcn-component-usage.md` — Component library integration patterns
- `package-integration-notes.md` — Third-party package integration notes
- `boilerplate-gaps.md` — What was missing and needed custom work

Use these to extract generalizable patterns for the toolkit.

## Rough Architecture Ideas

### Option A: Claude Code Skill (simpler)
A skill that:
- Maintains a YAML/JSON registry of boilerplates with metadata (tech stack, features, CLI command)
- Asks the user about their project requirements
- Matches requirements against registry
- Runs the best-fit boilerplate's scaffolding command
- Outputs a "what this gave you" + "what you still need to build" summary

### Option B: MCP Plugin (more powerful)
An MCP server that:
- Exposes tools for searching boilerplate registries (GitHub, npm, community lists)
- Provides `evaluate_boilerplate(url, requirements)` tool
- Provides `scaffold(boilerplate_id, config)` tool
- Returns structured metadata the agent can reason about

### Option C: Hybrid
- Skill for the workflow/interaction layer
- MCP plugin for the actual registry search and scaffolding execution

## Next Steps

1. Complete BSAM development
2. Write all four findings documents
3. Invoke `/superpowers:brainstorming` with this stub as context to design the full toolkit
4. Build the toolkit

---

*This file is a placeholder. Do not implement from this spec — it requires a full brainstorming session after BSAM is complete.*
