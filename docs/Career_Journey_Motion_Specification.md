# Career_Journey_Motion_Specification.md

## Project
AI Career OS — Career Workspace — Career Journey Motion and Navigation

## Status
Approved Revision — Replaces Previous Version

## 1. Landing Node → Career Workspace Transition

Required sequence:

1. user selects a career node
2. lock additional node selection
3. begin zoom toward selected node
4. keep Career Workspace hidden
5. selected node expands until it fills the viewport
6. switch transition state
7. reveal Career Workspace
8. remove Landing Page from visible rendering
9. unlock interaction

Recommended state model:

```ts
type CareerEntryState =
  | "landing"
  | "zooming-to-node"
  | "handoff"
  | "career-workspace"
```

Recommended total duration:

```text
Desktop: 900–1400ms
Mobile: 700–1100ms
```

## 2. Full-Screen Map Motion

Use one map transform layer:

```text
translate3d(x, y, 0) scale(s)
```

This transform must support:
- Overview fit
- Guided Journey
- Next / Back
- manual pan
- recenter
- viewport resize

## 3. Slower Guided Travel

Revised timing:

```text
Adjacent station:
Mobile: 750–1050ms
Desktop: 900–1300ms

Longer station move:
Mobile: 900–1250ms
Desktop: 1100–1500ms
```

Use:

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

## 4. Manual Drag / Pan

Support:
- mouse drag
- pointer drag
- touch drag

Behavior:
- capture pointer
- prevent text selection
- update map translation
- constrain to bounds
- preserve new map position
- keep journey state

Use a movement threshold to distinguish click from drag.

## 5. Guided State After Manual Pan

If the user pans away:
- current station remains active
- Continue remains available
- Overview remains available
- optional Recenter appears

Continue must move from the current manual position toward the next station.

## 6. Navigation Drawer Motion

Default:
- closed

Open:
- slide over map
- short restrained motion
- map remains mounted

Recommended duration:

```text
180–280ms
```

## 7. Hover Title Writing

Desktop hover:

1. position title above station
2. reveal first line
3. reveal next line if present
4. hold while hovered
5. hide on leave

Recommended:

```text
Per line: 220–380ms
Line stagger: 80–160ms
Total: 350–700ms
```

Do not use per-letter spans.

## 8. Station Details Motion

Station click opens details.

Desktop:
- compact modal or anchored overlay
- 180–260ms

Mobile:
- bottom sheet
- 200–300ms

Closing details must:
- restore station focus
- restore Continue / Overview
- preserve current station
- preserve transform
- preserve Guided Journey

## 9. Journey Controls

Remove permanent Details button.

Controls:
- Continue
- Back where applicable
- Overview
- optional Recenter

Modal state must not own or reset journey state.

## 10. Reduced Motion

When enabled:
- shorten career-entry zoom
- remove hover writing animation
- shorten map travel
- remove scale changes
- keep state transitions clear

## 11. Acceptance Criteria

1. Career Workspace appears only after node zoom completes.
2. No two pages overlap during entry.
3. Guided movement is slower.
4. Map drag works with mouse and touch.
5. Drag preserves journey state.
6. Continue works after manual drag.
7. Hover titles write line by line.
8. Navigation is collapsed by default.
9. Details open from station click.
10. Details close restores controls.
11. Journey does not restart after modal close.
12. Reduced motion works.
