# Career_Journey_Codex_Implementation_Prompt.md

## Prompt for Codex

You are applying a focused correction pass to the AI Career OS Career Workspace Roadmap.

Before editing code, read:

- `docs/README_FOR_AI.md`
- `docs/Career_Journey_Art_Direction.md`
- `docs/Career_Journey_World_Design.md`
- `docs/Career_Journey_Station_System.md`
- `docs/Career_Journey_Motion_Specification.md`

## Objective

Fix the current implementation so that:

1. Landing Page career-node zoom transitions cleanly into the Career Workspace.
2. The Landing Page and Career Workspace never appear together.
3. The Roadmap intro copy no longer overlaps the navigation.
4. The navigation is collapsed by default.
5. The Roadmap map fills the entire viewport.
6. No inset paper edges or large empty left area are visible.
7. The surface feels like an old treasure map / parchment / light leather-paper.
8. Users can drag and freely explore the map.
9. Station hover titles appear large and readable above each station.
10. Hover title writing happens line by line.
11. Guided travel is slower.
12. Station click opens details.
13. The permanent Details button is removed.
14. Closing details preserves the journey and restores controls.

## Scope

Modify only:
- Landing node → Career Workspace transition logic
- Career Workspace Roadmap layout
- Roadmap map surface
- navigation drawer
- map drag/pan
- station hover/focus behavior
- Journey controls
- station detail modal state
- responsive behavior
- reduced motion

Do not redesign unrelated areas.

## 1. Fix Career Entry Transition

Required sequence:

```text
Landing
→ selected node zoom
→ node fills viewport
→ handoff
→ Career Workspace appears
```

Use a controlled transition state such as:

```ts
type CareerEntryState =
  | "landing"
  | "zooming-to-node"
  | "handoff"
  | "career-workspace"
```

Rules:
- keep Career Workspace hidden during node zoom
- prevent simultaneous visible layers
- reveal Career Workspace only after zoom completion
- lock repeated node input during transition
- preserve selected career

## 2. Fix Roadmap Intro Layout

The “Zero to employment” title and description must:
- stay inside a safe map content area
- respond to menu open/closed state
- never sit behind navigation
- avoid station overlap

## 3. Collapse Navigation by Default

Default:
- navigation closed
- map uses full viewport width
- only a compact left-edge arrow/handle is visible

On open:
- drawer overlays map
- no permanent blank column
- close control remains visible

## 4. Full-Bleed Treasure Map Surface

Required:
- map covers entire Roadmap viewport
- no visible paper frame
- no large empty left area
- no white background outside map
- no inset page edges
- surface extends beyond viewport

Visual tone:
- old treasure map
- parchment or light leather-paper
- subtle wrinkles
- low-contrast grain
- warm muted tan
- hand-drawn pencil landmarks

Do not use a giant bitmap map.

## 5. Add Drag / Pan

Support:
- mouse
- pointer
- touch

Requirements:
- map transform updates with drag
- bounds prevent map loss
- no document scroll
- no text selection
- distinguish click from drag
- preserve current station
- preserve Guided Journey
- Continue still works after panning
- optional Recenter returns to current station

## 6. Slower Guided Movement

Use:

```text
Adjacent station:
Mobile: 750–1050ms
Desktop: 900–1300ms

Long move:
Mobile: 900–1250ms
Desktop: 1100–1500ms
```

Easing:

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

## 7. Station Hover Titles

Desktop hover:
- show a larger readable handwritten title above the station
- reveal it line by line
- keep it inside the viewport
- slightly strengthen landmark contrast

Mobile:
- use tap/focus
- do not depend on hover

## 8. Station Details Access

Remove the permanent `Details` button.

Open details through:
- station click
- station tap
- keyboard activation

Keep:
- Continue
- Back where applicable
- Overview
- optional Recenter

## 9. Fix Modal Close State

Required:
- modal state independent from journey state
- opening modal does not clear current station
- closing modal restores focus
- Continue and Overview reappear
- map transform remains unchanged
- Guided Journey remains active
- journey does not restart

## 10. Responsive Requirements

Test:
- 320 × 568
- 375 × 667
- 390 × 844
- 430 × 932
- standard desktop widths

Verify:
- no document scroll
- no horizontal overflow
- full-screen map
- drag works
- station titles readable
- modal close restores controls
- safe-area support

## 11. Performance Requirements

Use:
- SVG
- CSS
- reusable symbols
- one map transform layer
- transform and opacity
- pointer capture
- lightweight texture

Avoid:
- WebGL
- Three.js
- React Three Fiber
- heavy Canvas
- giant bitmap
- animated grain
- expensive full-map filters

## 12. Required Validation

1. Node zoom completes before Career Workspace appears.
2. No visible page overlap.
3. Intro copy does not overlap menu.
4. Menu is closed by default.
5. Map fills viewport.
6. No inset paper edge is visible.
7. Drag works.
8. Panning remains bounded.
9. Continue works after drag.
10. Hover title writes line by line.
11. Station click opens details.
12. No Details button remains.
13. Closing details restores Continue and Overview.
14. Journey does not restart.
15. Current station and transform are preserved.
16. Mobile works at all required sizes.
17. Reduced motion works.

## 13. Implementation Report

Return:
- Summary
- Files Changed
- Transition Fix
- Map Architecture
- Station Interaction
- Modal State Fix
- Testing
- Known Limitations

Implement the actual code changes now. Do not stop at a plan.
