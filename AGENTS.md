# AI Career OS — Repository Instructions

Before generating, modifying, or publishing any Career content, Learning milestone, resource, resource mapping, or Admin Studio workflow, read these files in order:

1. `docs/README_FOR_AI.md`
2. `docs/architecture/CAREER_RESOURCE_ARCHITECTURE.md`
3. `docs/adr/ADR-0001-separate-career-content-from-learning-resources.md`
4. The relevant Product, Engineering, Design, Career Workspace, Career Page Template, and AI content-generation specifications referenced by `docs/README_FOR_AI.md`

## Mandatory Career-resource rule

The required sequence is:

**Career-first, Resources-second, Mapping-third.**

During Career Blueprint generation:

- Complete Career identity, boundaries, roadmap, milestones, learning outcomes, tasks, assessments, projects, portfolio, jobs, interviews, and readiness criteria.
- Define Resource Requirement Contracts for every milestone.
- Do not select, invent, or embed external resource URLs.
- Do not mark a Career public-ready merely because its content or build is complete.

During the separate Resource Curation workflow:

- Register verified resources in the modular Central Resource Registry.
- Deduplicate by canonical URL.
- Map Reading, Video, and Practice resources to explicit milestone requirements.
- Validate that each mapping supports the declared learning outcomes.

A Career may be content-complete while resource mappings remain pending. A Career must not be publicly available until mandatory resource mappings, publication validation, automated tests, and visual QA are complete.

Do not copy another Career's journey content as a content template. Shared components and schemas are reusable; Career-specific professional content is not.
