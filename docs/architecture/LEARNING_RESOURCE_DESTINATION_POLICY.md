# Learning Resource Destination Policy

## Purpose

Career OS exists to reduce information overload. A learner should not have to search a provider site, browse a catalog, inspect a repository, choose between unrelated courses, or infer what to do after clicking a learning CTA.

The product therefore treats **destination fidelity** as part of resource quality, not as optional UX polish.

## Core rule

Every published Reading, Video, or Practice option must take the learner directly to the intended consumable learning artifact or the exact start action for that artifact.

A source can be reputable and still fail this rule if its URL is too broad.

## Mode requirements

### Reading

The link must open the exact article, documentation page, chapter, guide, lesson, or file that the learner is expected to read.

Reject:
- provider homepages
- learning catalogs
- topic/category landing pages when the learner must choose another item
- search results
- generic documentation roots when a specific page is intended

### Video

The link must open the exact selected video with a player available on that destination.

Reject:
- YouTube channel pages
- provider video libraries
- search results
- generic course/catalog pages that do not identify the selected video

A direct YouTube `watch?v=...` URL may be used only when that exact curated video is intentionally selected and a better authoritative direct-hosted alternative is not available.

### Practice

The link must open the exact lab, exercise, codelab, notebook, challenge, assessment, sandbox, or start flow.

Reject:
- GitHub repository landing pages that require the learner to discover setup instructions
- generic lab catalogs
- course indexes when another click/search is needed to find the exercise

A GitHub template exercise is acceptable only when the URL opens the repository-creation/start flow directly rather than the source repository home.

## Source quality order

Prefer sources in this order:
1. official organization, vendor, standards body, university, or recognized training provider
2. direct first-party learning artifact
3. reputable third-party resource when the first-party source does not provide an equivalent artifact
4. direct YouTube video only when a suitable higher-priority direct video is unavailable

## Runtime enforcement

`src/lib/references/referenceDestinationPolicy.ts` applies the Destination Fidelity Gate before a learning option is rendered as actionable.

If a destination is generic or ambiguous, `verifiedContentType` is downgraded and the CTA is disabled even if the registry entry was previously marked verified.

Known legacy links can be migrated through explicit, reviewed direct-destination overrides. Overrides must point to first-party or deliberately curated exact artifacts.

## Approval checklist

A learning option is publishable only when all answers are **yes**:

- Is the provider sufficiently credible for this topic?
- Does the title describe the exact artifact at the destination?
- Does one click take the learner to the intended content or start action?
- Can the learner immediately understand what to read, watch, or do?
- Does the destination match the declared mode?
- Has the URL been manually verified recently?
- Would a learner avoid having to search, browse, or choose among unrelated material?

If any answer is no, the resource is not publication-ready.
