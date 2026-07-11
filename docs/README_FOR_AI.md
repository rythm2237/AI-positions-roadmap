# AI Career OS
# README FOR AI

---

# Welcome

You are contributing to **AI Career OS**, an AI-powered Career Operating System.

This is **not** a traditional website or an online course platform.

It is a long-term AI-native product that helps users move from beginner to job-ready through structured learning, practical projects, AI mentorship, career tracking, portfolio building, and continuous growth.

Before making any changes, you MUST understand the project by reading the documentation in the required order below.

Never skip the required documents.

Never start implementation before understanding the existing architecture.

---

# Documentation Reading Order

## Level 1 — Core Documents (Always Read)

These documents define the platform itself.

They are mandatory for every implementation.

---

### 1. Product Vision

Read:

```
docs/product/Product_Bible.md
```

Purpose:

Understand:

- Product Vision
- Mission
- Product Philosophy
- User Journey
- Career DNA
- Knowledge Graph
- AI Mentor
- Long-term Goals

Defines:

**WHY the platform exists.**

---

### 2. Engineering

Read:

```
docs/engineering/Engineering_Bible.md
```

Purpose:

Understand:

- System Architecture
- Folder Structure
- Shared Systems
- Engineering Standards
- Scalability
- State Management
- Database
- Performance Strategy

Defines:

**HOW the platform is built.**

---

### 3. Design System

Read:

```
docs/design/Design_Bible.md
```

Purpose:

Understand:

- UX Principles
- UI Components
- Motion
- Layout
- Typography
- Accessibility
- Responsive Rules

Defines:

**HOW the platform should look and behave.**

---

# Level 2 — Task-Specific Documents

Read ONLY the documents relevant to the current task.

Examples:

---

## Career Workspace

Read:

```
docs/career-workspace/Career_Workspace_Specification.md
```

When:

- Building Career Workspace
- Updating shared workspace logic
- Building roadmap pages
- Progress integration
- Workspace navigation

---

## Career Journey Engine

Read:

```
docs/engineering/Career_Journey_Engine_Specification.md
```

When:

- Working on the Journey Engine
- Roadmap rendering
- Journey navigation
- Viewport movement
- Map rendering
- Motion system

---

## Career Page Template

Read:

```
docs/templates/Career_Page_Template_v2.md
```

When:

- Building career pages
- Updating page structure
- Creating new career workspaces

---

Future specifications should also belong here.

Examples:

- Landing Page Specification
- Career Builder Specification
- Admin Studio Specification
- Dashboard Specification
- AI Mentor Specification

Read only those required for the current task.

---

# Level 3 — AI Rules

Always read:

```
docs/ai/AI_Core_Rules.md
```

Then read ONLY the guide matching your AI model.

Examples:

Claude

```
docs/ai/Claude_Development_Guide.md
```

Codex

```
docs/ai/Codex_Development_Guide.md
```

ChatGPT

```
docs/ai/GPT_Development_Guide.md
```

Read the following document ONLY when the task is related to content generation:

```
docs/ai/AI_Content_Generation_Bible.md
```

Examples:

- Career generation
- Prompt generation
- Career Builder
- AI-generated content
- Content pipeline

Do NOT read it for normal software development tasks.

---

# Career Content

Career content is stored in:

```
content/careers/
```

These files are the single source of truth for career content.

Never simplify, rewrite, or modify career content unless explicitly instructed.

Your responsibility is to transform the content into a production-ready Career Workspace.

---

# Repository Inspection (Mandatory)

Before writing ANY code:

Inspect the current repository.

Search for existing:

- Components
- Hooks
- Services
- Utilities
- Types
- Stores
- Context Providers
- Data Models
- Shared Layouts

Reuse existing implementations whenever possible.

Never create duplicate architecture.

Extend existing systems instead of replacing them.

Only create new modules when no reusable solution exists.

---

# Implementation Principles

Always:

- Follow the Product Bible.
- Follow the Engineering Bible.
- Follow the Design Bible.
- Follow the relevant Specification documents.
- Follow the Career Page Template (when applicable).
- Follow AI Core Rules.
- Reuse existing architecture.
- Reuse existing components.
- Reuse existing hooks.
- Reuse existing utilities.
- Reuse existing services.
- Reuse existing data models.

Never duplicate business logic.

---

# Platform Integration

Every feature should integrate with the platform where applicable.

Examples:

- Dashboard
- Progress Tracker
- AI Mentor
- Personal Notes
- Portfolio
- Projects
- Career Readiness
- Search
- Analytics
- Achievements
- Related Careers
- User Settings

Never build isolated pages.

Everything should feel like one unified operating system.

---

# Development Rules

Before creating a new component:

1. Search existing components.
2. Reuse components whenever possible.
3. Extend components before creating new ones.

Before writing new logic:

1. Search hooks.
2. Search utilities.
3. Search services.
4. Search shared stores.

Never duplicate functionality.

---

# Code Quality Standards

Every contribution must be:

- Production Ready
- Type Safe
- Responsive
- Accessible
- Modular
- Reusable
- Performance Optimized
- Maintainable
- Scalable

Avoid:

- Placeholder implementations
- Temporary hacks
- Duplicate logic
- Unused code
- Hardcoded data
- Unnecessary dependencies

Unless explicitly requested.

---

# Documentation Priority

If documentation conflicts, follow this order:

1. Product Bible
2. Engineering Bible
3. Design Bible
4. Task-Specific Specification
5. Career Page Template
6. AI Core Rules
7. AI Content Generation Bible (only for content-generation tasks)
8. AI Development Guide
9. User Request

---

# Missing Information

If required information is missing:

Do NOT guess.

Instead:

- Explain what is missing.
- Stop implementation.
- Request clarification.

---

# Final Principle

Every contribution should improve the entire AI Career OS ecosystem.

Never optimize only for the current page or feature.

Always think in terms of:

- Long-term scalability
- Reusability
- Consistency
- Maintainability
- Performance
- User Experience

Every decision should make AI Career OS feel more like a unified Career Operating System.