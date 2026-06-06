---
name: update-software-architecture
description: |
  Maintains and incrementally updates the /docs/software-architecture.md file
  whenever architectural-level changes are introduced in the codebase.
---

# Software Architecture Maintenance Skill

## Purpose

This skill ensures that the file:

/docs/software-architecture.md

remains aligned with the actual architecture of the project.

It performs incremental updates only when meaningful architectural changes occur.

It must NOT regenerate the entire document unless explicitly instructed.

---

## When to Apply

Apply this skill ONLY when changes affect architecture, such as:

- New feature folders under src/app
- New Server Actions or major refactors
- New domain logic or validation rules
- New Prisma models or schema changes
- Dependency additions/removals in package.json
- Infrastructure changes (Docker, Vercel config, env vars)
- Authentication strategy changes
- Introduction or removal of architectural patterns
- Cross-cutting concerns (security, rate limiting, middleware)

Do NOT apply this skill for:

- Minor UI styling changes
- Pure JSX layout adjustments
- Small refactors with no architectural impact
- Text/UX copy changes
- Comment-only changes

---

## Responsibilities

When triggered, you must:

1. Analyze the recent code changes.
2. Determine architectural impact.
3. Update ONLY the relevant sections of:
   /docs/software-architecture.md
4. Preserve formatting and section structure.
5. Avoid duplication.
6. Avoid hallucinating architecture.

---

## Update Rules

- If a new feature module is added → update "System Architecture Overview" and "Component View".
- If new business logic is introduced → update "Layer Identification".
- If Prisma schema changes → update "Data Architecture".
- If dependencies change → update "Technology Stack".
- If infrastructure changes → update "Infrastructure & Deployment".
- If new risks are introduced → update "Risks & Technical Debt".
- If technical debt is reduced → reflect that improvement.
- Append a short log entry at the bottom:

### Architecture Updates - YYYY-MM-DD
- Brief summary of architectural impact introduced by this change.

---

## Constraints

- Do not modify business logic.
- Do not restructure the document.
- Do not rewrite unrelated sections.
- If architectural impact is unclear, explicitly state:
  "Architectural impact unclear from current change."

---

## Behavior Principle

This skill acts as an Architecture Governance Agent.

It updates architecture documentation only when structural or strategic changes occur.

It must remain silent for trivial or cosmetic modifications.
