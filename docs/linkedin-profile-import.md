# LinkedIn profile import

AI Role Path must not scrape public LinkedIn profile URLs. A profile URL is retained only as user-provided context.

Current complete-profile path:
- user exports their own LinkedIn profile with **Save to PDF**
- CV Analyzer extracts the full PDF text
- the full extracted text remains part of CV analysis
- normalized LinkedIn heading aliases (including `Top Skills` and `Certifications`) prefill structured CV fields
- sidebar-first exports, page noise, wrapped headings and repeated section continuations are tolerated
- each detected field keeps session-level `linkedin_pdf` provenance and confidence; reviewed edits become `manual`
- only missing fields are flagged for optional review, and the user may analyze immediately

Semantic analysis treats credible named products, implementation descriptions and case-study language as project evidence even when LinkedIn has no literal `Projects` section. Career discovery uses the canonical Career catalog and returns concise evidence/missing-signal explanations. Targeted analysis remains separate and scores only the selected Career.

Future direct integration:
- member-authorized LinkedIn OAuth only
- use approved LinkedIn API/partner permissions
- map authorized profile data into the same `Profile` shape used by the PDF import path
- preserve provenance and never claim fields that LinkedIn did not return

This architecture keeps the UI stable while allowing an approved direct LinkedIn connector to replace the PDF transport later.
