# AI CAREER — PROFESSIONAL AI WORKSPACE

## End-to-End Architecture, Implementation, Security, Billing, Smart Routing, Projects, Skills, Plugins & Production Release

You are acting simultaneously as:

- Principal Software Architect
- Principal Full-Stack Engineer
- Senior AI Engineer
- LLM Application Architect
- Agentic Systems Engineer
- Prompt Engineering Lead
- AI Gateway Architect
- Backend Engineer
- Frontend Engineer
- Database Architect
- Security Engineer
- Identity & Access Management Engineer
- SaaS Billing Architect
- FinOps / AI Cost Optimization Engineer
- UI/UX Designer
- QA Lead
- DevOps / Deployment Engineer
- Product Engineer

Your task is NOT to provide only recommendations, mockups, pseudo-code, or an architectural report.

You must inspect the existing AI Career / AI Role Path project, understand its current architecture and design system, and implement a professional AI Workspace end-to-end.

The final product should provide a polished AI experience comparable in usability to modern AI chat products while introducing capabilities specifically designed for AI Career.

The system must be architected as a reusable AI platform rather than a simple chatbot.

---

# 1. PROJECT BOUNDARY

Work ONLY inside the existing:

AI Career / AI Role Path / CareerOS project.

Do NOT modify unrelated projects.

Do NOT reuse unrelated RYTHM Company OS code unless there is already an intentional shared infrastructure dependency.

Preserve all currently working functionality.

Before modifying anything:

1. Inspect the repository.
2. Determine framework and application architecture.
3. Inspect authentication.
4. Inspect current database schema.
5. Inspect existing Supabase infrastructure if used.
6. Inspect Vercel configuration.
7. Inspect environment variables.
8. Inspect existing UI components.
9. Inspect AI Career design system.
10. Inspect current subscription/payment implementation if one exists.
11. Inspect existing OpenAI integration if one exists.
12. Inspect current user/account/project structures.
13. Inspect current production routing and domains.

Do not create duplicate infrastructure when reusable infrastructure already exists.

---

# 2. TARGET PRODUCT

Create a professional AI Workspace accessible through the AI Career ecosystem.

Preferred production location:

ai.

Use the project's actual production domain after inspecting the repository and deployment configuration.

The AI Workspace must feel like a native part of AI Career.

It must NOT visually look like an embedded third-party ChatGPT window.

It must use the existing AI Career:

- visual identity
- colors
- typography
- layout language
- spacing system
- buttons
- forms
- cards
- navigation
- responsiveness
- light/dark behavior where applicable
- user account architecture

The AI Workspace should have its own optimized application layout while remaining visually consistent with AI Career.

---

# 3. CORE PRODUCT PRINCIPLE

Do NOT build:

User → OpenAI API

Build:

User
↓
AI Career Authentication
↓
Access / Billing Gateway
↓
Usage & Cost Guard
↓
Request Intelligence Layer
↓
Intent Classifier
↓
Prompt / Skill Router
↓
Context Router
↓
Model Router
↓
Reasoning Router
↓
Tool / Plugin Router
↓
AI Execution Gateway
↓
OpenAI API / Approved Providers
↓
Response Evaluation
↓
Usage Accounting
↓
User Response

Every AI request MUST pass through the backend AI Gateway.

Never expose provider API keys to the browser.

---

# 4. MAIN USER EXPERIENCE

Build a modern AI chat environment.

The interface should support:

- New Chat
- Multiple conversations
- Streaming responses
- Rename conversation
- Delete conversation
- Archive conversation
- Search conversations
- Pin conversations
- Conversation history
- Markdown
- Code blocks
- Tables
- File attachments
- Images where supported
- Copy response
- Regenerate response
- Edit previous user message
- Retry
- Stop generation
- Feedback
- Model/Mode indicator where appropriate
- Token/cost-aware execution
- Responsive mobile experience

The desktop experience should have a professional sidebar.

Example:

New Chat

Projects

- AI Career
- Marketing
- Development
- Personal

Skills

- Career Coach
- CV Analyst
- Researcher
- Prompt Engineer
- Software Architect

Plugins

Saved Prompts

Usage

Account

Do not blindly reproduce ChatGPT UI.

Use AI Career's design system and improve where appropriate.

---

# 5. PROJECT SYSTEM

Implement a first-class Project system.

A Project represents an isolated AI workspace.

Each Project may contain:

- Project name
- Description
- Icon
- Instructions
- Conversations
- Files
- Knowledge
- Saved prompts
- Skills
- Enabled plugins
- Memory
- User preferences
- AI settings
- Cost settings
- Usage records

Suggested conceptual structure:

Project
├── Instructions
├── Conversations
├── Files
├── Knowledge
├── Memory
├── Skills
├── Plugins
├── Saved Prompts
├── AI Preferences
└── Usage

Projects MUST have context isolation.

Information belonging to one project must not accidentally leak into another project.

Provide:

- Create Project
- Rename Project
- Archive Project
- Delete Project
- Project settings
- Project instructions
- Project files
- Project AI preferences

---

# 6. AI REQUEST INTELLIGENCE LAYER

Before sending the user's main request to an expensive model, run a lightweight request classification process whenever economically justified.

Determine:

- task category
- complexity
- expected reasoning requirement
- whether current information is required
- whether web access is required
- whether file access is required
- whether code execution is required
- whether image capabilities are needed
- whether plugins/tools are needed
- whether project memory is relevant
- whether specialist instructions are needed
- expected context size
- approximate cost class
- risk level

Do not use an expensive classification model when deterministic routing or a lightweight model is sufficient.

Where safe and reliable, use:

- rules
- metadata
- heuristics
- cached decisions
- smaller models

before expensive reasoning models.

---

# 7. AUTOMATIC INTENT CLASSIFICATION

Create an extensible taxonomy.

Initial examples:

- General
- Career
- CV / Resume
- Cover Letter
- Job Search
- Interview Preparation
- Learning
- Research
- Prompt Engineering
- Software Development
- Debugging
- Architecture
- Data Analysis
- Marketing
- SEO
- Writing
- Translation
- Productivity
- Image
- Document Analysis
- Planning

Do NOT hard-code the entire product around these categories.

The architecture must allow additional categories and skills.

---

# 8. CORE PROMPT / SKILL ENGINE

Implement a professional Prompt/Skill system.

When the user's request is classified, the system may automatically select an appropriate Skill.

Examples:

- Career Coach
- CV Analyst
- Recruiter
- Interview Coach
- Job Researcher
- Prompt Engineer
- Full-Stack Engineer
- Software Architect
- Data Analyst
- SEO Specialist
- Marketing Strategist
- Research Analyst

Each Skill should support:

- ID
- name
- description
- category
- system instructions
- version
- owner
- visibility
- status
- allowed tools
- preferred model class
- reasoning preference
- max cost preference
- output rules
- creation timestamp
- update timestamp

---

# 9. THREE-LAYER PROMPT ARCHITECTURE

Do NOT place every instruction inside one giant prompt.

Use distinct layers:

## Layer A — Protected Platform System Instructions

Invisible and immutable to normal users.

Contains:

- security policies
- platform rules
- permissions
- cost protection
- tool restrictions
- data boundaries
- injection defenses
- application-level policies

Users must never be able to override this layer.

## Layer B — Skill / Core Prompt

Defines professional behavior for a specific task.

Example:

CV Analyst

Career Coach

Software Architect

Researcher

Prompt Engineer

Users MAY be allowed to inspect this layer depending on product settings.

## Layer C — User Customization

User-specific instructions.

Examples:

- tone
- response format
- preferred language
- domain assumptions
- custom instructions

Precedence:

Protected Platform Policy

>

Security/Tool Policy

>

Skill Instructions

>

Project Instructions

>

User Instructions

>

Current User Message

Never allow lower layers to override protected policies.

---

# 10. VIEW / EDIT AI INSTRUCTIONS

The user requested transparency over AI specialization.

Provide an interface such as:

AI Instructions

Using:
Career Coach v3.2

Allow authorized users to:

- View Skill description
- View editable Skill prompt where permitted
- Clone Skill
- Create Custom Skill
- Edit Custom Skill
- Save Custom Skill
- Version Custom Skill
- Restore previous version

Never expose:

- secrets
- API keys
- hidden security instructions
- internal abuse-prevention rules
- protected platform policy

Clearly distinguish:

Platform Rules — protected

Skill Instructions — potentially visible

Custom Instructions — editable

---

# 11. SMART MODEL ROUTER

Implement an AI Model Router.

The user should NOT need to understand every available model.

The Router must choose an appropriate model based on:

- task complexity
- required accuracy
- reasoning needs
- latency
- context size
- tool requirements
- modality
- user plan
- remaining budget
- estimated cost
- model availability

Do NOT permanently hard-code a model name if the provider offers a current model registry or configuration layer.

Create a model configuration table.

Example conceptual fields:

model_id
provider
model_class
enabled
input_cost
cached_input_cost
output_cost
tool_support
reasoning_support
vision_support
context_limit
latency_class
quality_class
fallback_model
updated_at

Model pricing MUST be configurable.

Do not scatter pricing constants throughout application code.

---

# 12. USER AI MODES

Provide simple user-facing modes.

Recommended initial modes:

AUTO

FAST

BEST

AUTO:
System dynamically balances quality, latency and price.

FAST:
Prefer lower-cost, lower-latency execution.

BEST:
Prefer higher-quality reasoning within the user's allowed budget.

Optionally support additional internal modes such as:

ECONOMY

BALANCED

DEEP REASONING

but do not overwhelm normal users.

AUTO should be the default.

---

# 13. SMART REASONING ROUTER

Reasoning level should also be selected dynamically where supported.

Conceptual levels:

none
low
medium
high
extra-high

Do NOT use high reasoning for trivial requests.

Examples:

Greeting → none

Simple rewrite → none/low

General answer → low

CV analysis → medium

Complex architecture → high

Difficult debugging → high

Very complex multi-stage reasoning → highest available when justified

Reasoning decisions must also respect budget.

---

# 14. COST-AWARE ROUTING

Combine AI quality routing with financial constraints.

Concept:

# task complexity + user mode + remaining budget + estimated request cost + available models

execution route

Example:

High-quality route:
estimated $0.18

Alternative route:
estimated $0.04

Remaining balance:
$0.12

The router should use the valid lower-cost route when quality remains acceptable.

If no compliant route exists:

do not send the API request.

Return a clear message explaining the budget constraint.

---

# 15. PRE-EXECUTION COST GUARD

Every request must pass through a server-side cost guard.

Before provider execution:

1. Check account status.
2. Check user plan.
3. Check guest status.
4. Check daily allowance.
5. Check monthly allowance.
6. Check remaining AI credit.
7. Estimate maximum reasonable request cost.
8. Determine whether the request can execute.

Use atomic/reservation-style budget protection where concurrency could cause overspending.

Do not rely only on frontend UI limits.

---

# 16. POST-EXECUTION COST ACCOUNTING

After provider response:

record actual usage.

Minimum ledger:

request_id
user_id
guest_id
project_id
conversation_id

provider
model
mode
reasoning_level

input_tokens
cached_input_tokens
output_tokens

tool_usage
web_usage
file_usage
image_usage

estimated_cost
actual_cost

billing_source

timestamp

Suggested billing_source:

subscription
guest_credit
promo_credit
admin_credit
trial_credit

Do not use floating-point arithmetic for financial accounting.

Use safe decimal or integer micro-units.

---

# 17. AI USAGE LEDGER

Create an append-oriented usage ledger suitable for:

- accounting
- debugging
- analytics
- user billing
- fraud detection
- cost optimization

Do not make mutable aggregate counters the only financial record.

Maintain ledger entries and derive/cache aggregates safely.

Support:

- daily usage
- monthly usage
- per-user usage
- per-project usage
- per-model usage
- per-skill usage
- per-tool usage

---

# 18. HARD USER COST LIMITS

Support limits such as:

daily_ai_budget

monthly_ai_budget

lifetime_credit

hard_limit_enabled

warning_threshold_percent

When the user reaches the hard limit:

NO additional provider request may be sent.

Example UI:

AI Usage

Used:
$7.82

Limit:
$10.00

Remaining:
$2.18

Warning:
80%

Provide warning states such as:

50%
80%
95%
100%

The hard enforcement remains backend-side.

---

# 19. PAID USER ACCESS

Design the system so paid access can be enabled.

Do NOT assume the final pricing.

Use configurable plans.

Example:

Starter
Plus
Pro

Plan configuration may include:

price
billing interval
AI allowance
projects
storage
plugin availability
advanced models
file limits
tool limits

Separate:

subscription revenue

from:

AI provider cost allowance

Example:

User subscription:
$15

Included AI allowance:
$7

The remaining subscription revenue may cover:

infrastructure
storage
payments
support
margin
other services

Do not expose internal provider cost unnecessarily unless explicitly required.

---

# 20. BILLING ARCHITECTURE

If an existing payment provider is already integrated into AI Career, reuse it where appropriate.

Otherwise implement the system using the project's chosen supported payment provider.

Billing architecture should support:

- subscription creation
- upgrade
- downgrade
- cancellation
- renewal
- failed payment state
- payment webhook verification
- plan synchronization
- entitlement updates
- invoices/receipts where supported

Never trust frontend payment state.

Webhook processing must be idempotent.

---

# 21. GUEST ACCESS

Implement Guest Code access.

An administrator must be able to create invitation codes.

Example:

CAREER-Y7K4-P9MX

Never store plaintext guest codes if avoidable.

Store a cryptographic hash.

Guest Code fields may include:

id
code_hash
label
status
created_by
created_at
expires_at
max_activations
activation_count
device_limit
initial_credit
monthly_credit
allowed_features
allowed_models
allowed_plugins
notes

---

# 22. GUEST ACTIVATION FLOW

Recommended flow:

Enter Guest Code

↓

Server validates code

↓

Check expiry

↓

Check activation limits

↓

Create Guest Identity

↓

Register device credential

↓

Assign credit/permissions

↓

Create secure session

↓

Open AI Workspace

The user should NOT need an email account for a basic invitation flow unless product policy requires it.

---

# 23. SINGLE-DEVICE GUEST ACCESS

The requirement is that a guest code can be exclusively activated for an intended user/device.

Do NOT attempt to obtain browser-inaccessible hardware identifiers.

Do NOT depend on MAC address.

Do NOT rely exclusively on IP address.

Do NOT rely solely on fragile browser fingerprinting.

Preferred architecture:

Guest Code
\+
Guest Identity
\+
Registered Device Credential
\+
Server Session

Preferred secure implementation:

WebAuthn / Passkey where practical.

Fallback:

server-issued high-entropy device credential
\+
Secure
\+
HttpOnly
\+
SameSite cookie
\+
server-side device registration

Never store provider API keys on the device.

---

# 24. DEVICE MANAGEMENT

Support:

Register Device

Revoke Device

Reset Device

Replace Device

Allow Additional Device

Guest code state should indicate:

unused

active

expired

revoked

blocked

exhausted

Provide administrators with device reset functionality.

---

# 25. GUEST CODE TYPES

Architect for multiple invitation policies.

Examples:

Demo

24-hour access
$1 credit
1 device

Private Guest

90-day access
$10 credit
1 device

Tester

30-day access
$20 credit
2 devices
Beta features

Lifetime Invite

No fixed expiration
Recurring monthly allowance
1 registered device

Do not hard-code these examples.

Implement configurable templates/policies.

---

# 26. GUEST → FULL ACCOUNT CONVERSION

Provide a migration path:

Guest
→
Registered AI Career Account

Where allowed, preserve:

- conversations
- projects
- files
- saved prompts
- skills
- remaining eligible credit
- preferences

Ensure ownership migration is transactional and auditable.

---

# 27. PLUGIN / CONNECTOR SYSTEM

Build an extensible Plugin architecture.

Potential categories:

- Google Drive
- Gmail
- Google Calendar
- GitHub
- Notion
- Supabase
- Microsoft services
- external SaaS
- custom APIs
- MCP servers

Do not tightly couple conversation logic to each provider.

Create normalized interfaces for:

- authorization
- scopes
- tool discovery
- invocation
- response normalization
- errors
- audit logs

---

# 28. OAUTH / CONNECTOR SECURITY

Where external services use OAuth:

- use proper OAuth flows
- request minimum scopes
- encrypt sensitive tokens
- support refresh tokens securely
- support revocation
- never expose secrets in frontend
- separate credentials between users
- provide disconnect functionality

Never allow one user's connector credentials to be used by another user.

---

# 29. TOOL PERMISSION MODEL

Each plugin/tool must support permissions.

Examples:

READ

WRITE

SEND

DELETE

EXECUTE

Require stronger confirmation for consequential actions.

Example:

Searching email:
may run automatically if permission allows.

Sending email:
may require explicit user confirmation.

Deleting records:
require confirmation.

Financial actions:
require stronger safeguards.

Maintain an audit trail.

---

# 30. PLUGIN UI

Create a Plugins / Connections page.

Each integration should show:

Connected

Not Connected

Permission Required

Expired

Error

Allow:

Connect

Reconnect

Disconnect

Manage Permissions

Users should also be able to control plugins per Project.

---

# 31. FILES & KNOWLEDGE

Allow users to upload supported files.

Potential:

PDF
DOCX
TXT
CSV
XLSX
images
other supported document types

Use safe validation.

Implement:

file metadata

ownership

project association

storage

processing status

knowledge indexing where appropriate

Do not blindly put entire large documents into every prompt.

Use retrieval where economically and technically appropriate.

---

# 32. PROJECT KNOWLEDGE / RETRIEVAL

When a project contains files or knowledge:

retrieve only relevant passages.

Pipeline:

User request
↓
Determine whether project knowledge is relevant
↓
Retrieve relevant context
↓
Apply token/cost limit
↓
Build AI request

Store retrieval provenance where useful.

---

# 33. MEMORY

Support controlled memory.

Separate:

Conversation Context

Project Memory

User Preferences

Do not create an uncontrolled memory dump.

Each memory should have:

scope

source

created_at

updated_at

confidence/relevance where useful

Allow users to inspect/manage stored project/user memory where appropriate.

---

# 34. SAVED PROMPTS

Provide Saved Prompts.

Users can:

Create

Edit

Duplicate

Delete

Categorize

Attach to project

Attach to skill

Run prompt

Potential fields:

name
description
content
variables
category
owner
visibility
version

Support reusable variables where practical.

Example:

{{job_description}}

{{company}}

{{cv}}

---

# 35. CUSTOM SKILLS

Users may create custom AI specialists.

Example:

My SEO Expert

My Career Coach

My Hungarian Translator

Each Custom Skill may configure:

instructions

preferred mode

allowed plugins

output format

project scope

Do NOT allow custom skills to bypass platform security policy.

---

# 36. RESPONSE EVALUATION

For high-value or high-risk workflows, optionally support post-generation validation.

Examples:

schema validation

tool result validation

citation validation

required sections

format validation

Do NOT automatically double model cost for every trivial chat.

Use evaluation selectively.

---

# 37. FALLBACK STRATEGY

Implement robust fallbacks.

If preferred model is unavailable:

Model A
→
Fallback Model B

If tool fails:

return clear tool error without corrupting conversation state.

If streaming fails:

support safe retry.

If provider times out:

use bounded retry with idempotency awareness.

Never retry unlimited times.

---

# 38. PROVIDER ABSTRACTION

Initially optimize for OpenAI.

However, isolate provider-specific code sufficiently so the entire application is not structurally dependent on one provider SDK.

Conceptual interface:

AIProvider

execute()

stream()

estimateCost()

getUsage()

supportsTool()

supportsModality()

Do not over-engineer a generic multi-provider platform if it delays the MVP, but avoid unnecessary lock-in.

---

# 39. OPENAI IMPLEMENTATION

Use the current recommended stable OpenAI APIs and SDK patterns available at implementation time.

Do not use deprecated APIs when a supported replacement exists.

Use appropriate support for:

- conversation/state
- streaming
- reasoning
- tools
- structured output
- file/retrieval capabilities
- web/search capabilities
- multimodal input

Do not assume model names/pricing from stale hard-coded knowledge.

Keep the model catalog configurable.

---

# 40. SECURITY — API KEYS

Critical:

Never expose OPENAI_API_KEY or any provider secret to:

browser

client bundle

localStorage

public environment variables

frontend source

API calls must follow:

Browser

↓

AI Career Backend Gateway

↓

Provider

Use server-only environment variables.

---

# 41. PROMPT INJECTION DEFENSE

Design for prompt injection.

Treat external content as untrusted.

Examples:

web pages

uploaded files

plugin output

emails

documents

tool results

Never allow external content to redefine platform rules.

Separate:

instructions

from:

data

Implement policy-aware tool execution.

---

# 42. DATA SECURITY

Apply:

authentication

authorization

row-level access

least privilege

secure secret management

encrypted transport

sensible retention

audit trails

If Supabase is used:

review and apply appropriate RLS policies.

Do not rely on obscurity or frontend checks.

---

# 43. RATE LIMITING

Implement:

per-IP protection

per-user limits

per-guest limits

per-route limits

AI execution throttling

Guest codes especially require abuse protection.

Return user-friendly rate limit responses.

---

# 44. CONCURRENCY / DOUBLE-SPEND PROTECTION

Prevent concurrent requests from spending beyond a user's budget.

Example:

Remaining balance:
$0.05

User submits 10 requests simultaneously.

The system must NOT allow all 10 to execute.

Use transactional reservation / atomic accounting.

Conceptually:

available balance
↓
reserve estimated amount
↓
execute
↓
settle actual cost
↓
release difference

Handle failed executions correctly.

---

# 45. ADMIN — AI CONTROL CENTER

Create an Admin AI Control Center integrated with the project's existing admin architecture.

Do not create a weak standalone admin login.

Use existing authorized admin identity.

Sections:

Overview

Users

Guests

Guest Codes

Plans

Usage

Costs

Models

Skills

Plugins

System Health

Audit Logs

---

# 46. ADMIN OVERVIEW

Show meaningful AI business metrics.

Examples:

Active AI users

Active guests

Requests today

Requests this month

AI cost today

AI cost this month

Revenue

Estimated gross AI margin

Average cost per user

Average cost per conversation

Most-used models

Most-used skills

Most-expensive models

Most-expensive skills

Failed requests

Tool failure rate

Do not show vanity metrics without utility.

---

# 47. ADMIN USER CONTROL

For each user display:

account

plan

status

AI allowance

used

remaining

projects

requests

last activity

Admin actions:

Pause AI

Block AI

Add credit

Remove/adjust credit with audit

Change plan

Set custom limit

View usage

View audit events

Do not silently alter financial data.

---

# 48. ADMIN GUEST MANAGEMENT

Display:

Guest identity

Guest code label

Status

Device registration

Budget

Used

Remaining

Expiry

Admin actions:

Pause

Block

Add Credit

Extend Expiration

Reset Device

Revoke Device

Allow Device

Disable Code

---

# 49. ADMIN GUEST CODE GENERATOR

Provide secure generation.

Admin sets:

Label

Expiration

Initial credit

Recurring allowance if applicable

Activation count

Device count

Allowed features

Allowed plugins

Notes

Generate high-entropy codes.

Do not use sequential or guessable codes.

Store only safe representations.

---

# 50. MODEL MANAGEMENT

Provide Admin configuration for model routing.

Ability to:

enable/disable model

set provider

update cost metadata

assign model class

assign quality tier

assign latency tier

define fallback

set per-plan availability

Avoid needing a code deployment just to update pricing or model availability.

Protect changes with admin audit logs.

---

# 51. SKILL MANAGEMENT

Admin must be able to:

Create Skill

Edit Skill

Publish

Disable

Version

Restore

Test

Configure tools

Configure routing preferences

Do not overwrite historical prompt versions.

Existing conversations should preserve sufficient execution metadata to identify which skill/version produced a response.

---

# 52. AUDIT LOG

Track consequential events.

Examples:

Guest code created

Guest code revoked

Device reset

Credit changed

Plan changed

Model config changed

Skill changed

Plugin connected

Plugin disconnected

Admin action

Sensitive tool action

Audit logs should be append-oriented and protected from ordinary users.

---

# 53. DATABASE DESIGN

Design normalized production-ready schemas.

Potential entities:

users

ai_profiles

ai_projects

ai_conversations

ai_messages

ai_project_files

ai_memories

ai_saved_prompts

ai_skills

ai_skill_versions

ai_model_registry

ai_routing_rules

ai_requests

ai_usage_ledger

ai_budget_reservations

ai_plans

ai_subscriptions

ai_entitlements

guest_codes

guest_identities

guest_devices

plugin_catalog

plugin_connections

project_plugins

tool_executions

audit_logs

Do not create tables blindly.

First inspect existing schemas and reuse appropriate account/project/billing entities.

Use migrations.

---

# 54. MESSAGE DATA MODEL

Messages should store enough metadata for reproducibility and debugging.

Potential:

message_id

conversation_id

role

content

created_at

model_used

skill_version

mode

tool_calls

usage_reference

status

Do not expose internal chain-of-thought.

Do not store hidden reasoning traces.

Store execution metadata, not private model reasoning.

---

# 55. CONVERSATION CONTEXT MANAGEMENT

Do not continuously resend unlimited full history.

Implement context management.

Possible strategy:

recent messages

-

relevant summarized history

-

project instructions

-

retrieved knowledge

-

memory

-

current request

Use token-aware trimming.

Avoid lossy summarization of critical information.

---

# 56. UX — CHAT INPUT

Professional composer should support:

multiline prompt

send

stop

file attachment

optional tool/plugin access indicator

mode selector

project/skill indicator

Good keyboard navigation.

Mobile must be excellent.

Do not create oversized controls that reduce usable chat area.

---

# 57. UX — AI ROUTING TRANSPARENCY

Normal users should not be overwhelmed by technical routing details.

Show simple information such as:

Auto

Fast

Best

Optionally allow an expandable panel:

Execution details

Model class

Skill used

Tools used

Estimated/actual usage

Do not expose security-sensitive backend details.

---

# 58. UX — COST TRANSPARENCY

Provide a Usage section.

Examples:

Monthly AI Usage

$4.20 / $10.00

Remaining

$5.80

Allow users to inspect usage history at an understandable level.

Optionally show:

conversation cost

project cost

daily usage

Do not force dollar/token detail into the normal conversation interface.

---

# 59. LIMIT REACHED EXPERIENCE

If user reaches budget:

Do not send provider requests.

Display a professional state.

Paid user:

AI usage limit reached.

Options depending on business rules:

Upgrade Plan

Add Credit

Wait for Renewal

Guest:

Guest AI allowance exhausted.

If allowed:

Convert Account

Purchase Plan

Contact administrator

Do not expose provider errors.

---

# 60. ACCESS TYPES

Support at least:

Registered Free

Paid

Guest

Admin

Potentially:

Trial

Promotional

Ensure entitlements are role/plan driven rather than many scattered conditional statements.

---

# 61. FEATURE ENTITLEMENTS

Build an entitlement system.

Potential entitlement examples:

ai.chat

ai.projects

ai.files

ai.web_search

ai.plugins

ai.custom_skills

ai.best_mode

ai.image

ai.advanced_reasoning

Limits:

max_projects

storage_mb

monthly_ai_credit

daily_request_limit

Do not tie product logic directly to plan names.

Plans grant entitlements.

---

# 62. OBSERVABILITY

Instrument:

request latency

model latency

stream start time

tool latency

failure rate

token usage

estimated cost

actual cost

routing decisions

fallback use

rate limits

Do not log secrets or sensitive message content unnecessarily.

Support correlation IDs.

---

# 63. ERROR HANDLING

Design user-friendly errors.

Never expose raw stack traces.

Categories:

Authentication Error

Budget Limit

Model Unavailable

Tool Error

Plugin Permission

Upload Error

Rate Limit

Network Error

Provider Error

Unknown Error

Provide safe retry when appropriate.

---

# 64. BACKGROUND JOBS

Long-running operations such as:

document processing

file indexing

large analysis

connector synchronization

should use an appropriate background job architecture if the existing stack supports it.

The application must not depend on the user's browser remaining open for server-side processing.

---

# 65. PERFORMANCE

Prioritize:

fast first render

fast streaming start

lazy loading

pagination

virtualized long conversation where necessary

efficient DB queries

context caching

prompt caching where supported

avoid redundant model calls

Do not fetch full conversation history unnecessarily.

---

# 66. COST OPTIMIZATION

Implement systemic optimization.

Use:

small models for classification where adequate

deterministic rules before AI where possible

prompt/context caching

retrieval instead of full-file injection

conversation summarization when appropriate

tool result caching where safe

shorter prompts

model routing

reasoning routing

output limits

budget-aware execution

Do not degrade important user outcomes solely to minimize cost.

Balance:

quality

cost

latency

---

# 67. PRIVACY

Provide clear separation between:

user content

project content

guest content

admin metadata

tool credentials

AI provider data

Do not make conversation content casually available in admin analytics.

Use aggregate metrics wherever possible.

Admin access to user content should follow clearly justified support/security policies if implemented at all.

---

# 68. RESPONSIVE DESIGN

Required:

Desktop

Tablet

Mobile

Mobile UI should NOT simply shrink desktop UI.

Sidebar should become an appropriate drawer/navigation pattern.

Chat composer must remain usable with mobile keyboard open.

Files, Projects, Usage and Plugins need mobile-friendly views.

---

# 69. ACCESSIBILITY

Apply:

semantic HTML

keyboard navigation

focus states

screen reader labels

appropriate contrast

ARIA only where necessary

accessible dialogs

reduced motion consideration

---

# 70. SEO

The authenticated AI Workspace itself does not require normal public SEO indexing.

Protect private AI routes appropriately.

However public marketing / pricing pages may be indexable.

Do not expose private conversations or project identifiers to search engines.

---

# 71. TESTING

Implement meaningful tests.

At minimum cover:

Authentication

Authorization

Project isolation

Conversation creation

Conversation persistence

Streaming

Skill selection

Model routing

Budget checks

Budget reservation

Budget exhaustion

Guest activation

Guest reuse prevention

Guest device binding

Guest expiration

Guest revocation

Guest → user conversion

Subscription entitlement

Plugin authorization

Tool permission

File ownership

Admin authorization

Rate limiting

Fallback behavior

Provider failure

Do not claim a test passed without execution evidence.

---

# 72. SECURITY TESTS

Specifically attempt:

Direct API invocation without auth

Changing user_id manually

Accessing another user's Project

Accessing another user's conversation

Guest code brute force

Guest code replay

Device token replay

Budget bypass

Concurrent budget overspend

Frontend entitlement bypass

Admin API access as normal user

Prompt injection through file

Prompt injection through tool output

Exposure of server API keys

Plugin credential leakage

Fix all confirmed vulnerabilities before release.

---

# 73. E2E USER JOURNEYS

Validate the real workflows.

## Paid User

Sign up/Login

↓

Open AI Workspace

↓

Create Project

↓

Start Chat

↓

Auto router chooses route

↓

Receive streamed answer

↓

Usage recorded

↓

Budget updated

## Guest

Open AI Workspace

↓

Enter Guest Code

↓

Activate device

↓

Receive guest identity

↓

Start AI chat

↓

Consume credit

↓

Refresh browser

↓

Session persists securely

↓

Try same code on another device

↓

Must follow configured device policy

## Limit

Use remaining allowance

↓

Hit hard limit

↓

Try another request

↓

Provider API must NOT be called

## Plugin

Connect provider

↓

Authorize

↓

Use allowed tool

↓

Review result

↓

Disconnect

↓

Tool access revoked

---

# 74. PRODUCTION RELEASE REQUIREMENTS

Do NOT deploy half-complete architecture directly to Production.

Use the project's established Git workflow.

Recommended:

feature branch

↓

implementation

↓

migrations

↓

tests

↓

security review

↓

build

↓

PR

↓

review

↓

merge

↓

single Production deployment where practical

↓

Production verification

Avoid unnecessary deployments.

---

# 75. ENVIRONMENT VARIABLES

Document required server-side variables.

Potential examples depending on actual stack:

OPENAI_API_KEY

payment provider keys

OAuth credentials

encryption secrets

guest-code secret/pepper where appropriate

Never commit secrets.

Use environment-specific settings.

---

# 76. FEATURE FLAGS

Use feature flags for high-risk functionality when appropriate.

Examples:

AI Workspace

Plugins

Guest Access

Best Mode

Custom Skills

New Model Router

Allow controlled rollout.

---

# 77. IMPLEMENTATION PHASES

Execute in a logical order.

Suggested sequence:

PHASE 1
Repository & architecture audit

PHASE 2
Database / domain architecture

PHASE 3
AI Backend Gateway

PHASE 4
Chat UI + conversations

PHASE 5
Projects

PHASE 6
Skill / Prompt Engine

PHASE 7
Model + Reasoning Router

PHASE 8
Cost Guard + Usage Ledger

PHASE 9
Guest Codes + Device Binding

PHASE 10
Paid entitlements / billing integration

PHASE 11
Files + knowledge

PHASE 12
Plugin architecture

PHASE 13
Admin AI Control Center

PHASE 14
Security hardening

PHASE 15
E2E + cost tests

PHASE 16
Production deployment

Do not unnecessarily wait for approval between normal engineering phases unless:

human credentials

provider consent

payment verification

OAuth authorization

MFA

or irreversible/high-risk external actions

are required.

---

# 78. ARCHITECTURAL DECISIONS

Document important decisions in the repository.

At minimum:

AI Gateway architecture

Prompt hierarchy

Model routing

Budget accounting

Guest device binding

Plugin security

Project isolation

Data retention

Billing entitlement model

Use ADR-style documentation if the project already follows that practice.

---

# 79. MVP VS FUTURE CAPABILITY

Do not compromise architecture, but distinguish between:

MVP REQUIRED

and

FUTURE EXTENSION

MVP should include at minimum:

Professional Chat

Conversation history

Projects

Core Prompt / Skills

Auto Prompt Router

Smart Model Router

Reasoning Router

User modes

Cost Guard

Usage Ledger

Guest Codes

Device-bound Guest Access

Usage UI

Admin AI management

Secure backend OpenAI integration

Responsive UI

Production deployment

Plugin architecture should at least have a stable foundation even if only a small number of connectors are enabled initially.

---

# 80. NON-NEGOTIABLES

Never:

Expose OpenAI API keys

Call OpenAI directly from an untrusted browser with privileged credentials

Trust client-side cost calculations

Trust client-side plan status

Trust client-side guest validation

Use IP as the only device identifier

Use MAC address assumptions in browser code

Allow user prompts to override platform security

Allow projects to leak context

Allow guest codes to be brute-forceable

Use unlimited AI retries

Create unlimited spend paths

Store plaintext sensitive secrets

Claim Production success without verification

Claim tests passed without running them

---

# 81. FINAL QUALITY BAR

The final result should feel like a real commercial AI product.

It should NOT feel like:

a demo

a thin OpenAI wrapper

a single textarea connected to an API

a prototype dashboard

or a ChatGPT iframe

The final system should provide:

AI Career branding

professional AI interaction

task-aware specialization

automatic prompt routing

automatic model selection

cost-aware AI execution

projects

memory

files

skills

plugins

guest access

paid access

financial controls

security

admin control

analytics

and extensibility.

---

# 82. FINAL VALIDATION

Before declaring completion, verify:

Production domain loads.

Authentication works.

Guest access works.

Paid/user access works according to configured entitlements.

Chat streams successfully.

Conversation persistence works.

Projects work.

Project isolation works.

Skill routing works.

Prompt hierarchy works.

Model router works.

Reasoning router works.

Cost estimation works.

Budget reservation works.

Usage ledger works.

Hard limit works.

No provider request occurs after limit exhaustion.

Guest code cannot exceed configured activation policy.

Device restriction works according to policy.

Admin controls work.

No API secrets exist in browser assets.

Plugins respect permissions.

Mobile layout works.

No critical console errors.

No critical server errors.

Production DB matches required migrations.

---

# 83. FINAL REPORT

At completion provide a concise factual report with:

IMPLEMENTED

VERIFIED

PARTIALLY IMPLEMENTED

REQUIRES HUMAN ACTION

REQUIRES PROVIDER ACTION

NOT IMPLEMENTED

Include:

Production URL

PR

Merge commit

Production deployment

Database migrations

AI Gateway status

Guest system status

Billing status

Plugin status

Model Router status

Cost Control status

Tests executed

Security checks

Known limitations

Do not mark anything VERIFIED without evidence.

---

# 84. EXECUTION RULE

Do not stop after analysis.

Do not only create an implementation plan.

After the initial repository audit, proceed with implementation.

When a decision can safely be made from engineering best practices and existing project architecture, make the decision and continue.

Only stop for the user where their direct action is genuinely required, such as:

login

OAuth consent

MFA

payment account authorization

secret creation on an external provider

domain/DNS ownership action

or an irreversible external decision.

Never ask the user to paste passwords, MFA codes, API secrets, private keys, access tokens, or sensitive credentials into chat.

Build this as the foundation of a scalable AI platform inside AI Career, not as a temporary chatbot feature.