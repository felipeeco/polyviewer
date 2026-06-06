---
name: css-and-design-awareness
description: |
  Ensures that new CSS, style definitions, and UI components respect existing
  design patterns, styles, and layout conventions present in this Next.js project.
---

# CSS and Design Awareness Skill

## When to apply
Use this skill whenever:
- Generating new components
- Creating or modifying CSS
- Adding or refactoring design or layout elements
- Introducing classes, design tokens, or styles in any file

## Project Context
This is a Next.js 16 project.
The existing CSS and styles define a design system with:
- Established color palette
- Typography scale
- Spacing and responsiveness
- Layout patterns
- UI component conventions

Any new styles must always respect and reuse this existing system.

## Rules

1. **Inspect existing styles first**  
   Before generating new CSS or style definitions, analyze the current CSS files,
   design tokens, Tailwind config (if present), and component style patterns.

2. **Reuse existing classes**  
   When adding style to new components, always attempt to use existing class
   names, utility classes, or shared component styles before creating new ones.

3. **Respect spacing & typography**  
   Follow the spacing scale, font sizes, line heights, and breakpoints defined
   in the design system.

4. **No arbitrary values**  
   Avoid introducing arbitrary values (colors, margins, padding) that do not
   exist in the current design system.

5. **Follow responsive conventions**  
   Ensure generated styles follow existing responsive patterns and breakpoints.

6. **Do not overwrite global styles**  
   Never modify `global.css`, `app.css`, or any global design tokens without
   explicit instruction.

7. **Component harmony**  
   New components must visually match the established style patterns:
   - Buttons, inputs, cards, headers, and layout spacings
   - Use consistent shadows, border radii, and interaction states

8. **Document deviations**  
   If introducing a new design token or spacing scale, include reasoning in
   an inline comment.

## Expected Behavior

When generating code:

1. Provide a short analysis of existing styles relevant to this request.
2. Suggest reusing existing classes first.
3. Only introduce new styles if absolutely necessary, and document why.
4. Confirm changes before global style modification.