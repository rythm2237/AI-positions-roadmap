# LinkedIn profile import

AI Role Path must not scrape public LinkedIn profile URLs. A profile URL is retained only as user-provided context.

Current complete-profile path:
- user exports their own LinkedIn profile with **Save to PDF**
- CV Analyzer extracts the full PDF text
- the full extracted text remains part of CV analysis
- recognizable LinkedIn sections prefill structured CV fields to avoid duplicate data entry
- user may review/edit imported fields before analysis

Future direct integration:
- member-authorized LinkedIn OAuth only
- use approved LinkedIn API/partner permissions
- map authorized profile data into the same `Profile` shape used by the PDF import path
- preserve provenance and never claim fields that LinkedIn did not return

This architecture keeps the UI stable while allowing an approved direct LinkedIn connector to replace the PDF transport later.