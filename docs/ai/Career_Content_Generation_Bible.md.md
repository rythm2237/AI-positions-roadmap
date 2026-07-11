# 📘 AI Career OS
# Career Content Generation Bible
## Version 1.0

---

# Purpose

# Purpose

This document defines how AI systems should generate career content inside AI Career OS.

It does NOT define software architecture, engineering rules, UI implementation, or coding standards.

Those belong to:

- Product Bible
- Engineering Bible
- Design Bible
- AI Core Rules

This document only defines the standards for generating high-quality Career content.

---

# 1. Source of Truth

Always consider the following documents as the highest priority.

Priority Order

1. Product Bible
2. Engineering Bible
3. Design Bible
4. Current Project Specifications
5. User Request

Never generate code that conflicts with higher-priority documents.

---

# 2. Think Like a Product Engineer

Do not think like:

- a content writer
- a UI designer only
- a coder only
- a chatbot

Think like an engineer building a long-term product platform.

Every decision must improve the operating system as a whole.

---

# 3. AI Career OS Is an Operating System

Never treat AI Career OS as:

- a website
- a landing page
- a blog
- a documentation site
- an LMS
- a collection of pages

Always treat it as:

- an AI-powered Career Operating System
- a connected ecosystem
- a long-term user workspace

---

# 4. Preserve Architecture

Never invent a new architecture.

Never replace existing architecture.

Never bypass shared systems.

Always integrate with the existing platform.

---

# 5. Reuse Before Creating

Before creating anything new, determine whether an existing solution already exists.

Reuse:

- Components
- Layouts
- Hooks
- Utilities
- Types
- Services
- APIs
- Data Models
- Animations
- Icons
- Design Patterns

Never duplicate functionality.

---

# 6. Never Duplicate Logic

Business logic must exist in one place only.

Never copy logic between:

Pages

Components

Hooks

Utilities

Services

Server Actions

Shared logic must always remain shared.

---

# 7. Respect Single Source of Truth

Every piece of data has one owner.

Never duplicate data.

Never create conflicting versions.

Never hardcode reusable information.

---

# 8. Build Complete Features

When implementing a feature, consider the complete ecosystem.

Every feature should integrate with relevant systems such as:

Dashboard

Progress

Roadmaps

Notes

Portfolio

Career Readiness

Achievements

AI Mentor

Search

Analytics

Notifications

Related Careers

Do not build isolated features.

---

# 9. Maintain Consistency

Every new feature must match the existing:

Architecture

UX

UI

Motion

Typography

Spacing

Interactions

Naming

Folder Structure

Coding Style

Do not introduce new patterns unless explicitly requested.

---

# 10. Mobile First

Every feature must work on:

Desktop

Tablet

Mobile

Never implement desktop-only functionality.

---

# 11. Accessibility

Every feature must support:

Keyboard Navigation

Screen Readers

Focus States

Accessible Contrast

Semantic HTML

Reduced Motion

Accessibility is mandatory.

---

# 12. Performance First

Prefer:

Server Components

Lazy Loading

Streaming

Code Splitting

Optimized Images

Minimal JavaScript

Avoid unnecessary re-renders.

Avoid expensive client-side logic.

---

# 13. Production Quality

Return production-ready implementations.

Do not return:

Examples

Pseudo-code

Tutorial code

Incomplete logic

Placeholder implementations

Mock functionality

Temporary hacks

Unless explicitly requested.

---

# 14. Keep Components Focused

Each component should have one responsibility.

Avoid large monolithic components.

Prefer composition over complexity.

---

# 15. Business Logic Separation

Business logic must not exist inside presentation components.

Separate:

Presentation

Logic

Data

State

Networking

Validation

---

# 16. Use Existing Data Models

Never invent new database structures without checking existing models.

Follow the canonical schema.

If extension is necessary:

Extend.

Do not replace.

---

# 17. Preserve User Progress

Never implement features that reset or invalidate:

Progress

Roadmaps

Projects

Portfolio

Achievements

Career Readiness

Notes

User history should remain intact.

---

# 18. AI Mentor Integration

Whenever appropriate, integrate with the AI Mentor system.

Do not create independent coaching systems.

There should only be one AI Mentor experience across the platform.

---

# 19. Career Awareness

Every career is connected.

Do not design career pages as isolated content.

Always consider:

Related Careers

Shared Skills

Career Transitions

Transferable Skills

Knowledge Graph

---

# 20. Explain Complex Decisions

If an implementation requires an important architectural decision:

Briefly explain:

Why

Trade-offs

Benefits

Avoid lengthy explanations.

---

# 21. Minimize Cognitive Load

Prefer:

Simple interfaces

Clear hierarchy

Progressive disclosure

Meaningful defaults

Reduce unnecessary decisions.

---

# 22. Build for Scale

Assume AI Career OS will eventually support:

Hundreds of Careers

Millions of Users

Thousands of Resources

Multiple Languages

Enterprise Features

Never design for a small demo project.

---

# 23. Follow the Knowledge Graph

Whenever entities are related:

Represent relationships.

Do not duplicate information.

Everything should connect naturally through the platform's knowledge graph.

---

# 24. AI Should Feel Human

AI-generated experiences should be:

Helpful

Professional

Context-aware

Encouraging

Transparent

Never:

Robotic

Overly verbose

Marketing-heavy

Artificially enthusiastic

---

# 25. Respect User Context

Always preserve existing:

Goals

Preferences

Career

Progress

History

Current Workflow

Avoid disrupting the user's journey.

---

# 26. Naming Consistency

Follow established naming conventions.

Never introduce inconsistent:

Component names

Folders

Variables

Hooks

Services

Routes

Database entities

---

# 27. Error Handling

Every implementation should include:

Validation

Loading State

Error State

Empty State

Success State

Recovery Strategy

Never ignore failure scenarios.

---

# 28. Future-Proof Everything

Build extensible systems.

Prefer configuration over hardcoding.

Prefer reusable patterns over one-off implementations.

Assume future expansion.

---

# 29. When Unsure

If multiple valid implementations exist:

Choose the one that:

Improves maintainability

Improves scalability

Improves consistency

Improves user experience

Reduces technical debt

---

# 30. Final Validation Checklist

Before considering any task complete, verify:

✓ Architecture preserved

✓ Existing components reused

✓ No duplicated logic

✓ Mobile responsive

✓ Accessible

✓ Production-ready

✓ Performance optimized

✓ Consistent with Design Bible

✓ Consistent with Engineering Bible

✓ Integrated with shared systems

✓ Extensible

✓ No unnecessary complexity

✓ Supports long-term product vision

---

# AI Core Principle

Every contribution should make AI Career OS feel more like a unified, intelligent Career Operating System—not a collection of disconnected pages or features.

If a solution improves only the requested page but weakens the overall platform, it is the wrong solution.

Always optimize for the long-term integrity, scalability, consistency, and intelligence of AI Career OS.