# AI Career OS
# Career Content and Learning Resource Architecture
## Version 1.0
## Status: Authoritative
## Decision date: 2026-08-03

---

# 1. Purpose

This document defines the authoritative architecture for separating Career content from Learning resources.

The core sequence is:

**Career-first, Resources-second, Mapping-third.**

Career generation must define what the learner must understand, practice, produce, and prove before any external learning resource is selected.

This architecture applies to:

- Career content generation
- Career Workspace data
- Learning milestones
- Resource curation
- Resource Registry
- Resource mapping
- Admin Studio workflows
- Validation and publication readiness
- AI, Codex, and developer contributions

If another document conflicts with this architecture, this document governs Career-to-resource separation.

---

# 2. Problem Statement

Career design and resource curation are different product concerns.

Combining them during Career generation creates recurring defects:

- Resource links are selected before the learning structure is stable.
- Resources are only loosely related to milestone outcomes.
- The same URL is duplicated across Career files.
- Career files become coupled to volatile third-party URLs.
- Shared template content can replace Career-specific learning design.
- A Career can appear available while Learning is incomplete.
- Resource maintenance requires editing many Career files.
- Admin Studio cannot distinguish content completeness from resource completeness.

The platform must therefore separate:

1. Career Blueprint
2. Resource Requirement Contract
3. Central Resource Registry
4. Resource Mapping
5. Resolved Learning Experience

---

# 3. Architectural Principles

## 3.1 Career-first

A Career must be designed independently of available courses, videos, or documentation.

The Career defines:

- Professional identity
- Scope and boundaries
- Responsibilities
- Skills and tools
- Roadmap phases
- Milestones
- Learning objectives
- Practical tasks
- Assessments
- Projects
- Portfolio evidence
- Job preparation
- Interview preparation
- Readiness criteria

A Career must not be reduced to a list of resources.

## 3.2 Resources-second

Resources are curated only after milestone outcomes are approved.

Resource curation asks:

- Which Reading option best supports the required outcome?
- Which Video option best explains or demonstrates it?
- Which Practice option lets the learner apply it?
- Is the source official, current, accessible, and sufficiently aligned?

## 3.3 Mapping-third

Career milestones never own volatile URLs.

They reference stable Resource Requirement IDs and, after curation, stable Resource IDs through a mapping layer.

## 3.4 Data-driven rendering

Career-specific learning content belongs in data.

Shared UI components render resolved milestone data.

Do not create Career-specific Learning UI components unless a documented product requirement makes reuse impossible.

## 3.5 Shared resources, Career-specific application

One resource may support several Careers.

The following must remain Career-specific:

- Learning objective
- Context
- Practical task
- Assessment
- Project evidence
- Readiness interpretation

Sharing a resource is allowed. Sharing an entire Career journey or generic milestone content is not.

---

# 4. Bounded Contexts

## 4.1 Career Blueprint

Owner: Career content system

Contains:

- Career identity and metadata
- Roadmap
- Milestones
- Outcomes
- Tasks
- Assessments
- Projects
- Portfolio
- Jobs
- Interviews
- Readiness
- Resource Requirement references

Must not contain external resource URLs.

## 4.2 Resource Requirement Contract

Owner: Career content system

Defines exactly what a milestone needs before resources are selected.

Minimum contract:

```ts
export type ResourceRequirement = {
  id: string;
  careerSlug: string;
  milestoneId: string;
  topic: string;
  requiredModes: ["reading", "video", "practice"];
  requiredLearningOutcomes: string[];
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  allowedContentTypes: string[];
  preferredProviders?: string[];
  officialPreferred: boolean;
  freePreferred: boolean;
  estimatedDuration: {
    minMinutes: number;
    maxMinutes: number;
  };
  resourceIds: string[];
};
```

Rules:

- Every milestone must define at least one Resource Requirement.
- Reading, Video, and Practice requirements are mandatory unless an explicit exception is documented.
- Outcomes must be measurable and milestone-specific.
- `resourceIds` may be empty during Career Blueprint production.
- Direct URLs are forbidden.

## 4.3 Central Resource Registry

Owner: Resource curation system

Contains each verified resource once.

Minimum record:

```ts
export type ResourceRecord = {
  id: string;
  title: string;
  provider: string;
  canonicalUrl: string;
  learningMode: "reading" | "video" | "practice";
  contentType: string;
  topics: string[];
  learningOutcomes: string[];
  skillLevels: string[];
  official: boolean;
  free: boolean;
  status: "active" | "needs-review" | "deprecated" | "broken" | "replaced";
  lastVerifiedAt: string;
  nextReviewAt: string;
  replacedBy?: string;
};
```

Rules:

- A canonical URL must not be registered under multiple IDs.
- Resource records are modular by domain, but exported through one logical Registry.
- Every active resource must have a verification date.
- Broken or deprecated resources cannot resolve into a public Learning experience.

## 4.4 Resource Mapping

Owner: Resource mapping system

Connects milestone requirements to Registry records.

Example:

```ts
export type ResourceMapping = {
  careerSlug: string;
  milestoneId: string;
  requirementId: string;
  mappings: {
    reading?: string;
    video?: string;
    practice?: string;
  };
  status: "pending" | "partial" | "complete" | "needs-review";
};
```

Rules:

- A mapping must reference existing Requirement and Resource IDs.
- Each selected resource must satisfy the relevant mode.
- Mapping completeness is independent from Career content completeness.
- A shared resource can be mapped to multiple Careers.

## 4.5 Resolved Learning Experience

Owner: Learning resolver and shared Learning UI

The resolver combines:

- Career milestone
- Resource Requirement
- Resource Mapping
- Registry record
- Progress and assessment state

Expected output:

```ts
{
  milestone,
  requirements,
  learningOptions: {
    reading: resolvedResourceOrNull,
    video: resolvedResourceOrNull,
    practice: resolvedResourceOrNull,
  },
  resourceStatus: "pending" | "partial" | "ready" | "needs-review",
}
```

The Learning UI must not infer resources or fall back to arbitrary direct links.

---

# 5. File Organization

Recommended structure:

```text
src/data/careers/
src/data/resources/
  microsoft/
  engineering/
  marketing/
  governance/
  shared/
src/data/resource-mappings/
src/types/resourceRequirement.ts
src/types/reference.ts
src/lib/resources/resourceResolver.ts
src/lib/resources/resourceValidator.ts
src/lib/resources/resourceMatcher.ts
```

A single logical Registry must be composed from modular domain files.

Do not create one unbounded multi-thousand-line resource file.

---

# 6. Career Lifecycle

Content, resources, and publication must have separate status dimensions.

Recommended model:

```ts
contentStatus:
  | "draft"
  | "complete"
  | "approved";

resourceStatus:
  | "not-defined"
  | "requirements-complete"
  | "mapping-in-progress"
  | "complete"
  | "needs-review";

publicationStatus:
  | "planned"
  | "preview"
  | "available";
```

Rules:

- `contentStatus: complete` does not mean resources are ready.
- A Career may be complete in Preview with resource mappings pending.
- A Career must not be `available` unless content is approved and required mappings are complete.
- Landing Page, Career Switcher, public routes, sitemap, and Learning availability must consume the same resolved publication status.

---

# 7. Public and Preview Behavior

## Preview and Admin

When resources are not mapped, show a controlled curation state:

- Resource requirement summary
- Missing modes
- Mapping status
- No fake link
- No generic fallback

## Production

A public learner must never encounter:

- An empty Learning section
- A technical Registry error
- A link unrelated to the milestone
- A placeholder presented as an actual resource
- An enabled assessment for content the learner could not access

A milestone with incomplete required mappings must remain blocked from public publication.

---

# 8. Admin Studio Workflow

Admin Studio must separate the workflow into these areas.

## 8.1 Career Content

- Identity
- Overview
- Roadmap
- Milestones
- Learning objectives
- Tasks
- Assessments
- Projects
- Portfolio
- Jobs
- Interview
- Readiness

## 8.2 Resource Requirements

For each milestone:

- Topic
- Reading requirement
- Video requirement
- Practice requirement
- Required outcomes
- Skill level
- Duration
- Preferred providers
- Official/free preference
- Allowed content types

## 8.3 Resource Registry

- Add or edit resource
- Canonical URL deduplication
- Provider
- Mode
- Content type
- Outcomes
- Verification status
- Review date
- Replacement chain

## 8.4 Resource Mapping

For every milestone:

```text
Reading  → mapped / missing / needs review
Video    → mapped / missing / needs review
Practice → mapped / missing / needs review
```

## 8.5 Readiness Dashboard

Admin must show at minimum:

```text
Career content: Complete
Resource requirements: Complete
Resource mappings: 21/30
Public readiness: Blocked
```

Publication controls must enforce this result rather than rely on human memory.

---

# 9. Validation Rules

Automated validation must reject:

- Direct external URLs in Career Blueprint files
- Milestones without Resource Requirements
- Requirements missing mandatory Reading, Video, or Practice modes
- Requirements without explicit learning outcomes
- Mappings to missing Resource IDs
- Mapping mode mismatches
- Duplicate Registry entries with the same canonical URL
- Active resources without verification metadata
- Available Careers with incomplete mappings
- Assessments unrelated to milestone outcomes
- Generic placeholder tasks or assessments
- A Career generated by copying another Career's journey content
- Divergent availability between Landing Page, Career Switcher, route registry, and Learning route

Validation should distinguish:

- Content validation
- Resource requirement validation
- Registry validation
- Mapping validation
- Publication validation

---

# 10. Migration Policy

Existing Careers may temporarily contain embedded resources during migration.

Migration sequence:

1. Preserve existing Career-specific learning structure.
2. Extract resource intent into Requirement Contracts.
3. Register unique resources centrally.
4. Create explicit mappings.
5. Switch Learning resolution to the new resolver.
6. Remove embedded URLs only after parity is verified.
7. Validate desktop, mobile, Preview, and public publication behavior.

Do not delete working Career content merely to satisfy the new schema.

Do not replace Career-specific content with shared template content during migration.

---

# 11. AI and Content Generation Rules

When generating a new Career:

## Phase A — Career Blueprint

Generate:

- Complete Career content
- Milestones
- Outcomes
- Tasks
- Assessments
- Projects
- Portfolio
- Jobs
- Interviews
- Resource Requirement Contracts

Do not:

- Select resource URLs
- Invent resources
- Create direct links
- Mark the Career public-ready

## Phase B — Resource Curation

In a separate workflow:

- Research candidate resources
- Verify relevance and freshness
- Deduplicate by canonical URL
- Add Registry records
- Map Reading, Video, and Practice options
- Validate outcomes
- Update resource readiness

AI-generated output is not complete merely because the application builds.

Completion requires schema validation, content validation, resource-state validation, and visual QA appropriate to the requested phase.

---

# 12. Definition of Done

## Career Blueprint complete

- Identity and boundaries are approved.
- Roadmap and milestones are Career-specific.
- Outcomes, tasks, assessments, projects, portfolio, jobs, and interviews are complete.
- Resource Requirement Contracts are complete.
- No direct resource URLs are embedded.

## Resource mapping complete

- Required Reading, Video, and Practice options are mapped.
- Every resource is active and verified.
- Each mapping supports the declared learning outcomes.
- No canonical URL duplication exists.

## Public-ready

- Career content is approved.
- Resource requirements are complete.
- Resource mappings are complete.
- Shared resolver returns valid options.
- Learning UI has no empty or technical error state.
- Assessments and progression operate correctly.
- Landing Page, Career Switcher, routes, sitemap, and Learning route agree on availability.
- Automated tests pass.
- Visual QA passes.

---

# 13. Final Rule

Career content defines the professional transformation.

Resources support that transformation.

Resources must never define, replace, or dilute the Career architecture.
