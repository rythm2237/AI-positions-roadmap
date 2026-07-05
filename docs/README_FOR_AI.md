# AI Career OS
# README FOR AI

---

## Welcome

You are contributing to **AI Career OS**, an AI-powered Career Operating System.

This is **not** a traditional website or an online course platform.

It is a long-term AI-native product that helps users move from beginner to job-ready through structured learning, practical projects, AI mentorship, career tracking, portfolio building, and continuous growth.

Before making any changes, you MUST understand the project by reading the documentation in the order below.

Do not skip documents.

---

# Documentation Order

## 1. Product Vision

Read:

docs/product/Product_Bible.md

Purpose:

Understand:

- Product Vision
- Mission
- Product Philosophy
- User Journey
- Career DNA
- Knowledge Graph
- AI Mentor
- Long-term goals

This document defines **WHY** the platform exists.

---

## 2. Engineering

Read:

docs/engineering/Engineering_Bible.md

Purpose:

Understand:

- System Architecture
- Project Structure
- Shared Systems
- Folder Organization
- State Management
- Database
- Scalability
- Engineering Standards

This document defines **HOW** the platform is built.

---

## 3. Design System

Read:

docs/design/Design_Bible.md

Purpose:

Understand:

- UX Principles
- UI Components
- Motion
- Layout
- Typography
- Accessibility
- Responsive Rules

This document defines **HOW** the product should look and behave.

---

## 4. Career Workspace

Read:

docs/career-workspace/Career_Workspace_Specification.md

Purpose:

Understand:

- Career Workspace architecture
- Shared components
- Section behaviors
- Interactions
- Integrations
- Progress logic

---

## 5. Career Page Template

Read:

docs/templates/Career_Page_Template_v2.md

Purpose:

Understand:

- Required sections
- Content hierarchy
- Career page structure

---

## 6. AI Rules

Read:

docs/ai/

Read only the files relevant to your model.

Examples:

Claude → Claude_Development_Guide.md

Codex → Codex_Development_Guide.md

ChatGPT → GPT_Development_Guide.md

Read AI Career OS – AI Generation Bible for the shared AI generation philosophy.

---

# Career Content

Career content is stored in:

content/careers/

These files are the single source of truth for career content.

Do not rewrite or simplify the content unless explicitly instructed.

Your responsibility is to transform the content into a production-ready Career Workspace.

---

# Implementation Principles

Always:

- Follow the Product Bible.
- Follow the Engineering Bible.
- Follow the Design Bible.
- Follow the Career Workspace Specification.
- Follow the Career Page Template.
- Reuse existing architecture.
- Reuse existing components.
- Reuse existing hooks.
- Reuse existing utilities.
- Reuse existing services.
- Reuse existing data models.

Never duplicate code or business logic.

---

# Integration Requirements

Every Career Workspace should integrate with the platform where applicable.

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

Never build isolated pages.

---

# Development Rules

Before creating a new component:

1. Search the existing project.
2. Reuse an existing component whenever possible.
3. Extend existing components instead of creating similar ones.

Before creating new logic:

1. Search existing hooks.
2. Search utilities.
3. Search services.

Never duplicate functionality.

---

# Code Quality

All generated code must be:

- Production-ready
- Type-safe
- Responsive
- Accessible
- Maintainable
- Modular
- Reusable
- Performance optimized

Avoid placeholder implementations unless explicitly requested.

---

# If Documentation Conflicts

Follow this priority:

1. Product Bible
2. Engineering Bible
3. Design Bible
4. Career Workspace Specification
5. Career Page Template
6. AI Generation Bible
7. AI Development Guide
8. User Request

---

# If Information Is Missing

Do not guess.

If required information is missing:

- Explain what is missing.
- Stop implementation.
- Ask for clarification.

---

# Final Rule

Every contribution should make AI Career OS feel more like a unified Career Operating System.

Never optimize only for the requested page.

Always optimize for the long-term quality, consistency, scalability, and maintainability of the entire platform.