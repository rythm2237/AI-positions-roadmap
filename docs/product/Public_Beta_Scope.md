# Public Beta scope

## Positioning

AI Career OS is a personal Career Operating System for AI, Automation & Digital Transformation. The Public Beta prioritizes complete role-specific guidance: choosing a direction, understanding the work, following one coherent roadmap and learning path, building proof, and preparing to get hired.

## Temporary public release gate

Career Intelligence remains part of the long-term platform architecture. During Public Beta, public Career Intelligence, salary comparison, market demand, live job statistics, unfinished integrations, pricing, and the CV Analyzer are hidden and unavailable to public browser traffic. Admin Studio, source governance, adapters, repositories, migrations, candidate history, and unpublished intelligence implementation remain intact. Automatic intelligence refresh stays disabled.

## Canonical career catalog

`src/data/careerCatalog.ts` is the source of truth for public career identity, title, professional domain, description, availability, route, and display order. Landing catalog, Career Network nodes, waitlist options, and future public career-name consumers must derive from it rather than maintaining independent arrays.

The catalog boundary includes roles where AI, automation, or digital transformation is central, plus direct foundations for building, deploying, securing, analyzing, or adopting AI systems. It is not a general IT catalog. Supporting roles must explain their connection to AI systems and digital transformation.

## Availability semantics

- **Available in Public Beta:** a complete, validated public Career Workspace with an active route and Open Workspace action.
- **Planned:** a catalog role without a complete public workspace. It may register interest, but it must not link to a placeholder, incomplete route, or generated shallow content.

## Career Workspace navigation

The Public Beta workspace has exactly seven destinations: Hero, Roadmap, Learning, Project, Portfolio, Jobs, and Interview Brief. Learning follows the same phases and progress model as Roadmap. Jobs provides application preparation and does not expose live salary, vacancy, or demand data.

## Completeness rule

Every visible public CTA must lead to a complete working experience. Unfinished public routes are gated with the application’s not-found behavior; they do not receive Coming Soon pages. Removed statistics are not replaced with fabricated claims. Existing progress, notes, assessments, projects, and user state remain compatible.
