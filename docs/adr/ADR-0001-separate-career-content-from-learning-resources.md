# ADR-0001: Separate Career Content from Learning Resources

- Status: Accepted
- Date: 2026-08-03
- Decision owners: Product and Engineering

## Context

Career creation previously mixed professional learning design with immediate resource selection. This caused unrelated resources, duplicate URLs, volatile links inside Career files, inconsistent publication status, and repeated use of generic Career templates.

Career content and resource curation have different lifecycles. Career milestones should remain stable while external courses, videos, documentation, and practice resources can change, expire, or be replaced.

## Decision

Adopt the following sequence:

**Career-first, Resources-second, Mapping-third.**

The system will separate:

1. Career Blueprint
2. Resource Requirement Contract
3. Central Resource Registry
4. Resource Mapping
5. Resolved Learning Experience

Career files define professional outcomes, milestones, tasks, assessments, projects, and resource requirements. They do not own volatile external URLs.

Resources are registered centrally and mapped to milestone requirements after Career content is complete.

Career content status, resource status, and publication status are separate.

A Career cannot be publicly available until mandatory resource mappings are complete and validated.

The authoritative specification is:

```text
docs/architecture/CAREER_RESOURCE_ARCHITECTURE.md
```

## Alternatives Considered

### Select resources while generating each Career

Rejected because it couples stable Career design to volatile external content and repeatedly produces weak or unrelated mappings.

### Keep all resources in each Career file

Rejected because it duplicates URLs, complicates maintenance, and prevents central verification and replacement.

### Use one global resource file without mapping contracts

Rejected because a resource list alone cannot express why a resource belongs to a specific milestone or which outcome it must support.

### Leave resources entirely undefined until later

Rejected because later curation would lack a precise contract. Resource Requirement Contracts must be created during Career design even when mappings are empty.

## Consequences

### Positive

- Career design remains Career-specific.
- Resource research can be batched and governed centrally.
- Duplicate and broken links are easier to prevent.
- Resources can be shared without sharing generic Career content.
- Admin Studio can report content and mapping readiness separately.
- Publication can be enforced through automated validation.

### Costs

- New schemas, resolver logic, Admin workflows, and migration tools are required.
- Existing Careers with embedded URLs must be migrated incrementally.
- Content completion and public readiness become separate milestones.

## Migration

Existing Career resources remain operational until their Requirement Contracts, Registry records, and mappings have parity. Migration must preserve working Career-specific content and must not replace it with generic templates.

## Enforcement

Documentation, schemas, Admin Studio, automated tests, and publication controls must enforce this ADR. A successful application build alone is not sufficient evidence of compliance.
