---
name: design-pattern-commenting
description: |
  Automatically enforces structured architectural pattern comments above new
  functions and significant logic blocks, without changing behavior.
---

# Design Pattern Commenting Skill

## Purpose

This skill ensures that significant new code blocks explicitly declare
architectural intent with a standardized comment block.

It inserts concise pattern/layer/responsibility comments above eligible code
while preserving existing logic.

---

## When to Apply

Apply this skill whenever:

- A new function is created
- A new exported function is introduced
- A new server action is added
- A new service layer method is added
- A repository-level query is created
- A DTO transformer or mapping function is written
- Validation logic is introduced

Do NOT apply this skill for:

- Inline arrow functions inside JSX
- Small local callbacks
- Purely cosmetic changes
- Comment-only changes

---

## Responsibilities

When triggered, you must:

1. Detect the architectural intent of the new code.
2. Infer the most appropriate design pattern.
3. Insert the required comment block immediately above the function or logic
   block if missing.
4. Keep comments concise and consistent with project commenting style.
5. Preserve existing business logic and behavior.

Use this exact block format:

```ts
/**
 * Pattern: <Design Pattern Name>
 * Layer: <Application | Infrastructure | Domain>
 * Responsibility: <Clear description of what this function does>
 */
```

---

## Pattern Classification Rules

Classify patterns using these labels when applicable:

- Utility Function
- DTO Transformer
- Repository Pattern
- Service Layer
- Application Use Case
- Validation Layer
- Factory
- Adapter
- Strategy
- Policy Enforcement
- Mapper
- Guard Clause

If unclear, default to:

`Pattern: Utility Function`

---

## Layer Rules

Assign layers using these rules:

- Application -> business logic, use cases, orchestration
- Infrastructure -> Prisma queries, persistence, external services
- Domain -> core domain rules or entities

If unclear, default to:

`Layer: Application`

---

## Constraints

- Do not rewrite existing comments.
- Do not duplicate pattern blocks.
- Do not modify business logic.
- Only insert comment blocks when missing.

---

## Behavior Principle

This skill acts as an Architectural Documentation Enforcer.

It ensures significant functions explicitly declare:

- Their design pattern
- Their architectural layer
- Their responsibility

It must remain silent for trivial functions.
