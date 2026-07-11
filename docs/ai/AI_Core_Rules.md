# AI Career OS
# AI Core Rules
## Version 1.0

---

# Purpose

This document defines the universal engineering and implementation rules that every AI must follow when contributing to AI Career OS.

These rules apply regardless of the AI model:

- Claude
- Codex
- ChatGPT
- Gemini
- Cursor
- Windsurf
- Future AI assistants

Model-specific guides may extend these rules, but they must never override them.

---

# 1. Think Platform First

Never optimize only for the requested feature or page.

Always consider:

- Product consistency
- Scalability
- Maintainability
- Performance
- Reusability
- User Experience

Every contribution should improve AI Career OS as a whole.

---

# 2. Follow the Documentation

Before writing any code:

1. Read `docs/README_FOR_AI.md`.
2. Read all required documents referenced there.
3. Follow the documentation priority defined in the README.

If documentation conflicts, follow the priority order defined in the README.

---

# 3. Inspect Before Creating

Before implementing anything:

- Inspect the repository.
- Search existing components.
- Search existing hooks.
- Search existing services.
- Search existing utilities.
- Search existing types.
- Search existing stores.
- Search existing layouts.
- Search existing data models.

Always extend existing systems before creating new ones.

Never duplicate architecture.

---

# 4. Reuse Before Building

Always prefer:

- Existing Components
- Existing Hooks
- Existing Services
- Existing Utilities
- Existing Types
- Existing Layouts
- Existing Design Patterns

Only create new implementations when no reusable solution exists.

---

# 5. One Source of Truth

Every piece of information must have one canonical owner.

Never duplicate:

- Business Logic
- Types
- Validation
- Constants
- State
- Data Models

The UI renders data.

Business logic owns data.

---

# 6. Separate Responsibilities

Keep these layers independent:

- Presentation
- Business Logic
- State
- Networking
- Validation
- Data

UI components must never contain business rules.

---

# 7. Data Before UI

Career-specific information must never be hardcoded inside reusable UI components.

The Engine renders data.

Career data should drive the interface.

Adding a new career should primarily require changing data—not UI code.

---

# 8. Mobile First

Every feature must work correctly on:

- Mobile
- Tablet
- Desktop

Never treat mobile support as a later improvement.

---

# 9. Accessibility

Every implementation must support:

- Keyboard navigation
- Semantic HTML
- Screen readers
- Focus visibility
- Sufficient contrast
- Reduced motion

Accessibility is mandatory.

---

# 10. Performance First

Prefer:

- CSS
- SVG
- Transform animations
- Lazy loading
- Code splitting
- Small reusable assets

Avoid:

- Heavy bitmap assets
- Large client bundles
- Unnecessary dependencies
- Expensive rendering
- WebGL unless explicitly required

Performance is more important than visual complexity.

---

# 11. Preserve Existing Functionality

Before changing an existing feature:

- Understand how it works.
- Preserve current behavior unless instructed otherwise.
- Avoid unnecessary rewrites.

Refactor only when it provides measurable architectural value.

---

# 12. Build Reusable Systems

Every new feature should answer:

"Can another part of AI Career OS reuse this?"

If yes:

Build it as a shared system.

If not:

Keep it isolated.

Avoid unnecessary abstraction.

---

# 13. Progressive Enhancement

Core functionality must remain usable when:

- Animations are disabled
- Reduced motion is enabled
- Decorative effects are removed

Enhancements should never block functionality.

---

# 14. Error Handling

Every implementation should include:

- Loading state
- Empty state
- Error state
- Recovery path
- Validation

Applications should fail gracefully.

Never crash because of missing or invalid data.

---

# 15. Production Quality

Every contribution must be:

- Production Ready
- Type Safe
- Responsive
- Accessible
- Modular
- Reusable
- Maintainable
- Performance Optimized

Avoid:

- Placeholder code
- Mock implementations
- Temporary hacks

Unless explicitly requested.

---

# 16. Documentation

When introducing new architecture:

- Keep naming consistent.
- Update documentation when necessary.
- Avoid undocumented architectural changes.

Documentation should evolve with the codebase.

---

# 17. Ask Instead of Guessing

If required information is missing:

Stop.

Explain what is missing.

Request clarification.

Never invent business rules or architecture.

---

# 18. Final Validation Checklist

Before completing any implementation, verify:

✓ Repository inspected

✓ Documentation followed

✓ Existing systems reused

✓ No duplicated logic

✓ Mobile responsive

✓ Accessible

✓ Production-ready

✓ Performance optimized

✓ Consistent with Engineering Bible

✓ Consistent with Design Bible

✓ Integrated with shared platform systems

---

# Final Principle

AI Career OS is an AI-powered Career Operating System.

Never build isolated pages or one-off solutions.

Every implementation should strengthen the platform's long-term consistency, scalability, maintainability, and user experience.