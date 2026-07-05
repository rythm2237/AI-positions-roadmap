# 📘 AI Career OS
# Career Component Specification
## Version 1.0

---

# Purpose

This document defines the implementation rules for every section inside a Career Workspace.

The Career Page Template defines the content.

This document defines the UI components, behaviors, state management, interactions, and integration requirements.

Every career page must use these shared components.

Never create career-specific UI components unless absolutely necessary.

---

# Career Workspace

A Career Workspace consists of the following sections.

Each section is a reusable module.

Each module integrates with shared systems.

---

# 1. Hero Section

Component

CareerHero

Contains

- Career Title
- Description
- Category
- Difficulty
- Learning Time
- Salary
- Hiring Demand
- Remote Availability
- AI Compatibility
- Career Status
- Primary CTA
- Bookmark
- Share

Actions

- Start Learning
- Continue Learning
- Bookmark
- Share

Integrations

- User Progress
- Dashboard
- Career Readiness

---

# 2. Career Snapshot

Component

CareerSnapshotCard

Layout

Responsive card grid

Contains

- Hiring Demand
- Growth Rate
- Automation Risk
- Job Security
- AI Usage
- Future Outlook

Updates

Static content

---

# 3. Career Overview

Component

CareerOverview

Contains

- Overview
- Responsibilities
- Industries
- Companies
- Daily Work
- Importance

Supports

Collapsible sections

---

# 4. Career Match

Component

CareerFitCard

Contains

Good Fit

Not Ideal

Requirements

Traits

Working Style

Expandable

Yes

---

# 5. Day In The Life

Component

Timeline

Contains

Morning

Afternoon

Evening

Interactions

Expand activities

---

# 6. Career Roadmap

Component

RoadmapTimeline

Children

RoadmapPhase

Each Phase Contains

- Goal
- Duration
- Topics
- Courses
- Resources
- Missions
- Mini Project
- Quiz
- Notes
- Mentor
- Progress

Integrations

Progress

Notes

Quiz

AI Mentor

Dashboard

---

# 7. Skills

Component

SkillGrid

Child

SkillCard

Each Skill

- Importance
- Difficulty
- Progress
- Description

Supports

Filter

Search

Grouping

---

# 8. Tools

Component

ToolGrid

Child

ToolCard

Each Tool

- Logo
- Name
- Description
- Official Website
- Category
- Use Cases

Supports

Filter

Categories

---

# 9. Learning Resources

Component

ResourceGrid

Categories

Free

Paid

Books

Videos

Documentation

Communities

Certificates

Supports

Sorting

Filtering

Priority labels

---

# 10. Hands-on Missions

Component

MissionGrid

MissionCard

Each Mission

Objective

Difficulty

Deliverables

Estimated Time

Completion

Integrations

Progress

Dashboard

Achievements

---

# 11. Portfolio Projects

Component

ProjectGrid

ProjectCard

Contains

Description

Technologies

Skills

GitHub

Live Demo

Difficulty

Time

Completion

Integrations

Portfolio

Progress

Career Readiness

---

# 12. Certifications

Component

CertificateGrid

CertificateCard

Contains

Provider

Difficulty

Cost

Recognition

Duration

Official Link

---

# 13. AI Tools

Component

AIToolGrid

ToolCard

Grouped By

Coding

Research

Agents

Models

Productivity

Deployment

---

# 14. Career Progression

Component

CareerPath

Visual Graph

Previous Careers

Current Career

Next Careers

Integrations

Knowledge Graph

Career Explorer

---

# 15. Salary

Component

SalaryTable

Contains

Junior

Mid

Senior

Lead

Remote

Country Filter

---

# 16. Daily Workflow

Component

WorkflowTimeline

Contains

Time

Activity

Tools

Purpose

---

# 17. Real World Use Cases

Component

UseCaseGrid

Contains

Industry

Description

Example

---

# 18. Job Preparation

Component

JobPreparationWorkspace

Modules

Resume

LinkedIn

GitHub

Interview

Checklist

Applications

Integrations

Dashboard

Career Readiness

AI Mentor

---

# 19. AI Mentor

Component

MentorPanel

Contains

Tips

Warnings

Recommendations

Career Advice

Interview Advice

Actions

Ask AI

Generate Plan

Explain

---

# 20. Community

Component

CommunityGrid

CommunityCard

Contains

Platform

Description

Members

Official Link

---

# 21. FAQ

Component

FAQAccordion

Supports

Search

Expand

Collapse

---

# 22. Related Careers

Component

CareerRecommendationGrid

CareerCard

Uses

Knowledge Graph

Career Similarity

Career DNA

---

# 23. Personal Notes

Component

NotesPanel

Features

Markdown

Auto Save

Tags

Search

Integrations

User Notes

Dashboard

---

# 24. Progress Tracker

Component

CareerProgress

Contains

Progress Ring

Completed Phases

Projects

Certificates

Readiness

Integrations

Dashboard

Analytics

Achievements

---

# 25. Career Readiness

Component

ReadinessPanel

Displays

Overall Score

Strengths

Weaknesses

Recommendations

AI Feedback

---

# 26. 30-Day Plan

Component

LearningPlan

Weekly Cards

Week 1

Week 2

Week 3

Week 4

Completion

Progress

---

# 27. 90-Day Plan

Component

LearningTimeline

Monthly Cards

Month 1

Month 2

Month 3

---

# 28. Final Challenge

Component

CapstoneProject

Contains

Requirements

Deliverables

Evaluation

Rubric

Completion

---

# 29. Final Assessment

Component

AssessmentWorkspace

Modules

Technical Review

Portfolio Review

Resume Review

Interview Simulation

Career Readiness

Final Recommendation

---

# Shared Rules

Every section must

- Support Light Mode
- Support Dark Mode
- Be Mobile First
- Be Keyboard Accessible
- Support Loading State
- Support Empty State
- Support Error State
- Use Shared Components
- Use Shared Design Tokens
- Support Analytics
- Support AI Mentor Context
- Integrate with Dashboard where applicable

---

# Component Reuse Policy

Career pages must never create new versions of:

Buttons

Cards

Accordions

Progress

Notes

Quizzes

Mentor

Timeline

Grid

Tables

Forms

Dialogs

Reuse shared components.

---

# Architecture Rule

A Career Workspace is a composition of reusable components.

Career content changes.

Components do not.

Every new career must reuse the exact same component architecture.

Only the data changes.