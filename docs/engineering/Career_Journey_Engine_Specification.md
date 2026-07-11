# AI Career OS
# Career Journey Engine Specification
## Version 1.0

---

## 1. Purpose

This document defines the reusable Career Journey Engine used by every Career Workspace inside AI Career OS.

The Engine presents a career roadmap as a large, interactive, non-scrolling map rather than a traditional vertically stacked webpage.

It must remain lightweight, responsive, accessible, data-driven, and reusable across all careers.

The AI Engineer career is the first implementation, but no part of the Engine may be hardcoded specifically for that career.

---

## 2. Product Intent

The Career Journey must feel like an interactive workspace rather than a website.

The user should experience:

- A clear Hero as the first scene.
- A dedicated Roadmap mode with no page scrolling.
- A large virtual map that is larger than the viewport.
- Smooth movement across the map in multiple directions.
- One focused station at a time during guided journey mode.
- Direct access to each station’s lessons, resources, notes, tests, and completion status.
- Visible progress from beginner to job readiness.

The experience should feel exploratory and directional without becoming visually heavy, game-like, or dependent on 3D rendering.

---

## 3. Scope

The Engine must provide:

- Hero-to-Roadmap transition.
- Large map workspace.
- Station positioning.
- Viewport movement.
- Guided journey mode.
- Overview mode.
- Station detail interactions.
- Responsive behavior.
- Progress and locking states.
- Reduced-motion behavior.
- Theme support.
- Data-driven rendering.
- Integration points for notes, tests, resources, portfolio, job preparation, and career readiness.

The Engine must not require:

- WebGL.
- Three.js.
- React Three Fiber.
- Heavy Canvas rendering.
- Large bitmap backgrounds.
- 3D camera systems.
- Complex physics.
- Game engines.

---

## 4. Core Principles

### 4.1 No Page Scrolling

The Career Workspace must not use vertical document scrolling as its primary navigation.

The browser viewport remains fixed.

Movement occurs inside the Journey Workspace.

Allowed patterns:

- Translating the map.
- Switching scenes.
- Opening modals.
- Opening bottom sheets.
- Opening internal panels.
- Using contained internal scrolling only where long content requires it.

Not allowed:

- Long stacked sections.
- Scroll-based article navigation.
- Infinite page layouts.
- Roadmap content extending the document height.

### 4.2 Lightweight First

The Engine must prioritize performance over visual complexity.

Preferred technologies:

- React.
- TypeScript.
- CSS transforms.
- SVG paths and symbols.
- CSS gradients and patterns.
- Framer Motion only if already installed.
- Small reusable visual assets.
- CSS masks.
- Transform-based animation.

Avoid:

- Large PNG/JPG map backgrounds.
- Continuous high-cost animation.
- Excessive blur layers.
- Expensive SVG filters.
- Large client bundles.
- Unnecessary third-party dependencies.

### 4.3 Data-Driven Rendering

Career-specific data must live outside UI components.

The Engine renders the map based on structured career data.

Changing a career must require changing data, not layout code.

### 4.4 Reusable Across Careers

All careers must use the same Journey Engine.

Career differences may include:

- Map theme.
- Station names.
- Station positions.
- Station visual types.
- Roadmap phases.
- Resources.
- Tests.
- Projects.
- Job-readiness stages.

The Engine architecture must remain unchanged.

---

## 5. Experience Structure

A Career Workspace contains two primary scenes.

### Scene A — Hero

The initial scene shown after entering a career.

Contains:

- Career visual.
- Career title.
- Short description.
- Primary CTA.
- Compact progress summary.
- Compact secondary actions.
- Left navigation.

The roadmap is not visible by default.

### Scene B — Roadmap Workspace

Activated when the user chooses Roadmap.

Contains only:

- Full-screen map.
- Transparent left navigation.
- Transparent current-station title area.
- Optional station controls.
- Optional station details modal or bottom sheet.

All non-roadmap page content is hidden.

---

## 6. Map Workspace

### 6.1 Virtual Map

The map must be larger than the viewport.

Recommended logical dimensions:

- Desktop: approximately 3000–5000 px wide and 1800–3200 px high.
- Tablet: responsive logical dimensions derived from the same normalized coordinate system.
- Mobile: the same conceptual map, rendered through responsive scaling and viewport translation.

The Engine should use normalized coordinates or a stable logical coordinate system.

```ts
type MapPoint = {
  x: number;
  y: number;
};
```

Coordinates should not depend directly on the current screen size.

### 6.2 Map Movement

The map itself moves beneath a fixed viewport.

Use transform-based movement:

```css
transform: translate3d(x, y, 0) scale(scale);
```

The browser page does not scroll.

The map may move:

- Horizontally.
- Vertically.
- Diagonally.
- Along curved conceptual paths.

The map should create the feeling that the user is traveling through a large world.

### 6.3 Overview Mode

Overview Mode shows the complete journey.

Requirements:

- Entire roadmap fits inside the viewport.
- All stations remain readable at a high level.
- The route from start to job readiness is understandable.
- Station labels may be shortened.
- Secondary station details remain hidden.
- The user can select any unlocked station.

Overview Mode should not use excessive zoom-out that makes text illegible.

### 6.4 Guided Journey Mode

Guided Journey Mode leads the user through stations one by one.

Requirements:

- Only the current station is emphasized.
- Other stations should generally remain outside the visible viewport.
- The local environment around the current station stays visible.
- Movement between stations is smooth and continuous.
- The user controls progression using Next and Back.
- Exit Journey returns to Overview Mode.
- Start Learning opens the first available learning station.

---

## 7. Viewport Controller

Create a reusable viewport controller.

Suggested responsibilities:

- Calculate map translation.
- Calculate responsive scale.
- Center a station.
- Move between stations.
- Return to overview.
- Respect reduced-motion settings.
- Prevent invalid positions.
- Track current focused station.
- Handle mobile viewport dimensions.
- Maintain movement state.

Suggested hook:

```ts
useJourneyViewport()
```

Suggested API:

```ts
type JourneyViewportController = {
  mode: "hero" | "overview" | "journey";
  focusedStationId: string | null;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  showOverview: () => void;
  focusStation: (stationId: string) => Promise<void>;
  moveToNext: () => Promise<void>;
  moveToPrevious: () => Promise<void>;
  exitJourney: () => void;
};
```

---

## 8. Motion Rules

### 8.1 Motion Philosophy

Motion must:

- Explain location changes.
- Reinforce direction.
- Maintain orientation.
- Feel calm and intentional.
- Avoid unnecessary spectacle.
- Remain smooth on mid-range mobile devices.

### 8.2 Entering the First Station

When Start Journey is selected:

1. The overview slightly re-centers if required.
2. Movement begins toward the first station.
3. The map translates continuously.
4. Scale adjusts gradually.
5. The station arrives near the visual focus point.
6. The station becomes active.
7. The title and summary appear.

Avoid:

- Teleporting.
- Sudden scale jumps.
- Excessive zoom.
- Long cinematic delays.
- Multiple staged pauses.

Recommended duration:

- 900–1400 ms total on desktop.
- 650–1000 ms total on mobile.

### 8.3 Moving to the Next Station

When Next is selected:

1. Apply a small zoom-out.
2. Begin translation immediately.
3. Continue movement without stopping.
4. Follow the conceptual direction between stations.
5. Arrive at the next station.
6. Apply a small zoom-in.
7. Update title and summary.

The sequence must feel like one continuous motion.

Recommended total duration:

- 1100–1800 ms desktop.
- 800–1300 ms mobile.

### 8.4 Reduced Motion

When `prefers-reduced-motion: reduce` is enabled:

- Remove live camera-style travel.
- Use a short fade or direct transform update.
- Keep all functionality.
- Do not remove orientation cues.
- Do not disable navigation.

---

## 9. Station System

### 9.1 Station Definition

Each station represents a step in the journey.

Example station categories:

- Orientation.
- Foundation.
- Core Skill.
- Tool.
- Project.
- Portfolio.
- CV.
- LinkedIn.
- Job Search.
- Interview.
- Final Assessment.
- Job Ready.

### 9.2 Station Data Model

```ts
type JourneyStation = {
  id: string;
  order: number;
  phaseId: string;
  title: string;
  shortTitle?: string;
  summary: string;
  description: string;
  position: MapPoint;
  mobilePosition?: MapPoint;
  visualType: JourneyStationVisualType;
  environment?: JourneyEnvironmentType;
  statusRule?: JourneyStatusRule;
  estimatedTime?: string;
  prerequisites?: string[];
  lessons?: JourneyLesson[];
  resources?: JourneyResource[];
  missions?: JourneyMission[];
  test?: JourneyTest;
  noteContext?: JourneyNoteContext;
  nextStationId?: string;
  previousStationId?: string;
};
```

### 9.3 Station Visual Types

The Engine may support lightweight symbolic types such as:

- Camp.
- Mountain.
- Bridge.
- Village.
- Library.
- Workshop.
- Harbor.
- Gate.
- Tower.
- Ruins.
- City.
- Launch Point.

These should use:

- Small SVG components.
- CSS shapes.
- Iconography.
- Shared visual tokens.

They must not be floating dashboard cards.

### 9.4 Station States

Every station supports:

- Locked.
- Available.
- In Progress.
- Completed.
- Current.

Visual requirements:

- Locked stations are muted and non-interactive.
- Available stations are visible but not dominant.
- Current station receives focus treatment.
- Completed stations display a clear success indicator.
- State must not rely on color alone.

---

## 10. Station Interaction

When the user selects a station:

Desktop:

- Open a focused modal or lightweight anchored panel.

Mobile:

- Open a bottom sheet or full-screen modal.

The station detail view may contain:

- Overview.
- Lessons.
- Resources.
- Missions.
- Notes.
- Test.
- Completion status.
- Estimated time.
- Next action.

The right-side permanent information window should not be required.

---

## 11. Title and Live Summary

During Guided Journey Mode, show:

- Current station title.
- Short summary.
- Optional live typing effect.

Requirements:

- Position near the top of the viewport.
- Transparent or glass-style background.
- Low visual dominance.
- High readability.
- Does not obscure the station.
- Does not block map interaction.

On mobile:

- Use compact typography.
- Limit summary length.
- Allow expansion if necessary.

---

## 12. Journey Controls

Controls should feel integrated with the map.

Required controls:

- Next.
- Back.
- Exit Journey.
- Start Learning.
- Open Details.

Placement:

- Near the current station when practical.
- Bottom-center or contextual mobile placement where necessary.

Do not place journey controls in a large website-style header.

---

## 13. Map Visual System

The map should feel like a simplified, premium treasure map without requiring heavy artwork.

Recommended lightweight layers:

1. Base background.
2. Paper or terrain pattern.
3. Land contours.
4. Water shapes.
5. Route path.
6. Environment symbols.
7. Station symbols.
8. Fog or atmospheric gradients.
9. Progress highlights.
10. UI overlay.

Visual elements may include:

- Mountains.
- Rivers.
- Forest clusters.
- Bridges.
- Caves.
- Ruins.
- Ports.
- Islands.
- Cliffs.
- Compass marks.
- Subtle gold route accents.

The style should remain modern and premium, not cartoonish or pirate-themed.

---

## 14. Theme System

Create a theme configuration layer.

```ts
type JourneyTheme = {
  id: string;
  name: string;
  background: string;
  terrainPattern: string;
  pathStyle: JourneyPathStyle;
  stationStyles: Record<JourneyStationVisualType, JourneyStationStyle>;
  environmentPalette: JourneyEnvironmentPalette;
  overlayStyle: JourneyOverlayStyle;
};
```

Initial theme:

- `treasure-map`

Future themes may include:

- Mountain Expedition.
- Tech City.
- Cyber Fortress.
- Space Colony.
- Research Archipelago.
- AI Laboratory.

The theme system must not require changes to the Engine.

---

## 15. Route and Connections

The roadmap path must not be circular.

Requirements:

- Clear start and end.
- Natural forward progression.
- Optional branches only if the career data requires them.
- Final destination must represent job readiness.
- Route should be rendered as SVG paths.
- Completed portions may glow or change style.
- Locked portions remain visually subdued.

Example connection model:

```ts
type JourneyConnection = {
  from: string;
  to: string;
  path?: string;
  type?: "primary" | "optional" | "branch";
};
```

---

## 16. Responsive Strategy

### 16.1 Mobile-First Requirements

The Engine must work at:

- 320 × 568.
- 375 × 667.
- 390 × 844.
- 430 × 932.

Requirements:

- No document-level overflow.
- No hidden controls.
- No unreadable labels.
- No content behind system safe areas.
- Touch targets at least 44 × 44 px.
- Station detail views fit within viewport.
- Bottom navigation does not cover active controls.
- Journey title remains compact.
- One focused station remains visible.

### 16.2 Mobile Map Strategy

Preferred:

- Same logical map.
- Separate responsive transform calculations.
- Optional mobile coordinates for stations.

Allowed:

- Reduced environmental density.
- Simplified station labels.
- Fewer decorative symbols.
- Reduced blur and particles.
- Shorter movement duration.

Do not create a completely unrelated mobile roadmap.

### 16.3 Desktop Strategy

Desktop may display:

- More environment details.
- Longer movement paths.
- Larger overview.
- Transparent left navigation.
- Contextual station controls.

---

## 17. Left Navigation

The existing left navigation may remain.

In Roadmap Mode:

- Use transparent or glass treatment.
- Reduce visual dominance.
- Highlight current section.
- Keep keyboard access.
- Allow return to Hero and other workspace areas.
- Collapse on small screens into a drawer or bottom navigation.

---

## 18. Landing Page Integration

Clicking a career node on the Landing Page must directly open the corresponding career.

Required behavior:

1. User clicks the node.
2. Existing node-selection animation may run briefly.
3. Route navigation begins automatically.
4. No second Enter button is required.
5. Career Hero loads first.
6. Roadmap opens only when selected by the user.

Routing must use the canonical career slug.

Example:

```text
/careers/ai-engineer
```

Do not make the roadmap the initial career scene.

---

## 19. Progress and Gating Integration

The Journey Engine must display progress but should not own business logic.

Progress source:

- Shared progress service/store.
- Database when available.
- Local persistence only as a temporary fallback.

Each station may be unlocked based on:

- Previous station completion.
- Required mission completion.
- Test pass score.
- Phase exam completion.

The Engine receives status and renders it.

The Engine must not duplicate progress calculations.

---

## 20. Notes Integration

Every station may expose a Note action.

Selecting Note opens the shared Notes modal.

The note context should include:

```ts
type JourneyNoteContext = {
  careerId: string;
  phaseId?: string;
  stationId?: string;
  lessonId?: string;
  resourceId?: string;
};
```

Closing the note modal must return the user to the same map position.

---

## 21. Resource Integration

Each station may contain:

- Free videos.
- Articles.
- Courses.
- Official documentation.
- Practice resources.

Each resource should include:

```ts
type JourneyResource = {
  id: string;
  title: string;
  type: "video" | "article" | "course" | "documentation" | "practice";
  provider: string;
  url: string;
  access: "free" | "paid" | "freemium";
  estimatedTime?: string;
  priority: "essential" | "recommended" | "optional";
  description?: string;
};
```

The Engine displays resources but does not generate them.

---

## 22. Test Integration

Each learning station may contain a test.

The Engine must support:

- Locked-next-station state.
- Pass threshold.
- Retry.
- Score display.
- Review guidance.
- Phase exam markers.

The test system should remain a separate reusable module.

---

## 23. Accessibility

Requirements:

- Keyboard navigation between stations.
- Visible focus states.
- Semantic button roles.
- ARIA labels for stations.
- Screen-reader-friendly station order.
- Reduced-motion support.
- Sufficient contrast.
- Status not communicated by color alone.
- Modals must trap focus correctly.
- Escape closes overlays where appropriate.

A linear accessible roadmap representation may be provided to screen readers while the visual map remains non-linear.

---

## 24. Performance Budget

Target goals:

- No WebGL dependency.
- No large map bitmap.
- Initial Journey Engine JavaScript kept minimal.
- Lazy-load station detail content.
- Decorative SVG assets should be small and reusable.
- Avoid continuous animation when idle.
- Disable expensive effects on low-power/mobile modes.
- Keep interaction at or near 60 FPS on typical mid-range devices.
- Prevent layout shifts.
- Use transform and opacity for motion.

Suggested budget:

- Initial roadmap visual assets: under 500 KB where practical.
- Additional lazy-loaded station content excluded from initial load.
- No single decorative asset larger than 150 KB without justification.

---

## 25. Error and Fallback States

The Engine must support:

- Missing station data.
- Invalid station coordinates.
- Missing resource links.
- Empty roadmap.
- Failed content load.
- Unsupported animation environment.

Fallback behavior:

- Show a simplified static roadmap.
- Preserve station access.
- Preserve navigation.
- Never crash the Career Workspace.

---

## 26. Suggested Component Architecture

```text
components/
  career-journey/
    CareerJourneyEngine.tsx
    JourneyViewport.tsx
    JourneyMap.tsx
    JourneyPath.tsx
    JourneyStation.tsx
    JourneyEnvironment.tsx
    JourneyOverview.tsx
    JourneyGuidedMode.tsx
    JourneyControls.tsx
    JourneyTitleOverlay.tsx
    JourneyStationModal.tsx
    JourneyMobileSheet.tsx
    JourneyFallback.tsx

hooks/
  useJourneyViewport.ts
  useJourneyNavigation.ts
  useReducedJourneyMotion.ts

lib/
  journey/
    calculateOverviewTransform.ts
    calculateStationTransform.ts
    validateJourneyData.ts
    journeyTypes.ts

themes/
  journey/
    treasure-map.ts
```

Adapt this structure to the existing repository architecture rather than duplicating existing folders.

---

## 27. Suggested Career Data Structure

```ts
type CareerJourneyData = {
  careerId: string;
  slug: string;
  themeId: string;
  map: {
    width: number;
    height: number;
    overviewPadding?: number;
  };
  phases: JourneyPhase[];
  stations: JourneyStation[];
  connections: JourneyConnection[];
  environment?: JourneyEnvironmentItem[];
};
```

All career-specific content must come from this structure or the project’s canonical equivalent.

---

## 28. Acceptance Criteria

The Engine is acceptable only when:

- Career Hero remains the first career scene.
- Clicking Roadmap opens a full-screen map workspace.
- The page does not vertically scroll.
- The map is larger than the viewport.
- The map moves smoothly in multiple directions.
- Guided journey focuses one station at a time.
- Movement between stations is continuous.
- Mobile layout works at 375 × 667.
- The left navigation remains usable but visually secondary.
- Station details open without a permanent right panel.
- The roadmap is data-driven.
- The AI Engineer career uses the shared Engine.
- No WebGL or Three.js is required.
- Landing-page career nodes navigate directly to the correct Hero.
- Reduced-motion mode remains fully functional.
- Existing progress, notes, tests, and resources can integrate without duplication.

---

## 29. Implementation Sequence

Codex should implement the Engine in controlled phases.

### Phase 1 — Architecture and Data Contract

- Inspect existing repository.
- Identify reusable components.
- Define types.
- Define data validation.
- Document integration points.

### Phase 2 — Static Map Workspace

- Fixed viewport.
- Large map.
- Stations.
- Paths.
- Overview mode.
- No journey motion yet.

### Phase 3 — Viewport Movement

- Focus station.
- Next and Back.
- Smooth translation and scale.
- Reduced-motion fallback.

### Phase 4 — Station Details

- Desktop modal/panel.
- Mobile bottom sheet.
- Contextual actions.

### Phase 5 — Responsive Refinement

- Small mobile sizes.
- Safe areas.
- Controls.
- Labels.
- Performance.

### Phase 6 — Landing Integration

- Direct career-node navigation.
- Career Hero as first scene.
- Roadmap entered only through selection.

### Phase 7 — AI Engineer Migration

- Move current roadmap data into the shared data contract.
- Remove hardcoded career-specific UI.
- Validate existing features.

---

## 30. Final Principle

The Career Journey Engine should create the feeling of navigating through a large career map without the complexity and performance cost of a 3D scene.

The experience must remain:

- Simple.
- Fast.
- Clear.
- Immersive.
- Responsive.
- Reusable.
- Maintainable.

The Engine succeeds when users feel they are progressing through a journey rather than scrolling through a webpage.
