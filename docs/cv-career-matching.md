# CV Analyzer Career Matching

## Baseline before recruiter-grade matching

`PR #91` replaced Career-slug ranking rules with a catalog-derived concept model. Its final Career score was:

```text
8
+ conceptCoverage × 72
+ directRoleIdentity × 10
+ catalogTermCoverage (maximum 5)
+ substantialProjectBonus (maximum 5)
```

Concept evidence was capped by channel, so repeated keywords did not create unlimited credit. However, semantic coverage, evidence strength, duration, recency and essential Career requirements were still combined inside one score. As a result, generic analytics could provide excessive credit to adjacent Careers such as Data Scientist.

## Recruiter-grade architecture

The canonical Career inventory remains `src/data/careerCatalog.ts`.

Two companion modules add matching intelligence without duplicating Career descriptions:

- `careerRequirements.ts` owns the reusable capability taxonomy and concise requirement groups. Explicit profiles are used where adjacent Careers cannot be distinguished safely through broad catalog semantics. Other Careers derive requirements from their canonical title, domain and description.
- `careerEvidence.ts` classifies detected evidence by professional context, implementation depth, relevant duration and recency.

`careerMatching.ts` combines those inputs and returns five independently visible dimensions:

```text
Role relevance         30%
Professional evidence  25%
Core requirements      25%
Trajectory             10%
Transferability        10%
```

The weighted score is evidence alignment, not hiring probability.

## Core requirement limiter

Core requirements are represented as capability groups. Any capability inside a group can satisfy that requirement, but transferable capabilities never satisfy a core group.

Core coverage also constrains the maximum final score:

| Core coverage | Maximum score |
| --- | ---: |
| No core groups covered | 42 |
| Below 25% | 50 |
| Below 75% of the Career minimum | 62 |
| Below the Career minimum | 72 |
| Minimum met but core-quality score below 60 | 84 |
| Strong core coverage | 96 |

This permits a profile to show strong transferability and strong professional history while retaining low confidence for a Career whose essential capabilities are absent.

## Professional evidence contexts

Evidence quality is derived from source context rather than employer prestige:

- `employed_role`
- `independent_role`
- `self_employed`
- `implemented_project`
- `project_description`
- `certification`
- `education`
- `skills_list`
- `summary_claim`

Implementation evidence is strongest. An unsupported summary or skills-list claim remains weak. Independent work is evaluated by implementation, deployment, duration, scope and outcomes rather than being categorically discounted.

## Relevant duration

Date ranges in relevant experience are converted into approximate months and reported through these buckets:

- `<6 months`
- `6–12 months`
- `1–2 years`
- `2–4 years`
- `4+ years`

Duration modifies professional-evidence confidence only for capabilities detected inside that dated role. Unrelated years of experience do not improve a Career score, and years are never used as a direct score multiplier.

## Trajectory and transferability

Trajectory uses current or recently ended direct core evidence, plus recent implemented projects. Supporting evidence alone can indicate direction but cannot create a strong Career trajectory without direct core evidence.

Transferability is calculated independently. It explains useful adjacent experience—such as operations, process improvement or decision support—while the core-requirement limiter prevents it from substituting for essential skills.

## Explanation integrity

Every match exposes:

- strongest direct evidence;
- transferable evidence;
- limiting factors;
- detected professional contexts;
- relevant duration;
- confidence based on evidence quality and core coverage.

Missing signals are generated only from requirement capabilities that were not detected. The same capability cannot be both detected and reported as missing.
