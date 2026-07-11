# Career_Journey_World_Design.md

## Project
AI Career OS — Career Workspace — Career Journey World Design

## Status
Approved Revision — Replaces Previous Version

## 1. Purpose

The Roadmap is a full-screen, draggable, oversized treasure-map surface that extends beyond the viewport.

## 2. Full-Bleed World

Required:
- no visible paper frame
- no outer blank margin
- no fixed left dead zone
- no white background behind the map
- no permanent side column

The paper/leather texture must cover the entire map world.

## 3. Logical World Size

Recommended:

```text
Width: 2600 units
Height: 1800 units
SVG viewBox: 0 0 2600 1800
```

The world must be larger than the viewport to support drag exploration and guided travel.

## 4. Default View

On Roadmap entry:
- navigation is collapsed
- map fills the viewport
- Overview Mode fits the full route
- no paper edges are visible
- start, current, and final stations are readable

## 5. Navigation Drawer

Default:
- collapsed
- compact arrow or handle at left edge
- map uses full viewport

Open:
- drawer overlays the map
- map remains mounted
- drawer may use translucent paper/leather styling
- close action remains visible

## 6. Intro Copy Placement

The Roadmap title and supporting copy must not overlap the drawer.

Use responsive positioning tied to the drawer state.

## 7. Free Map Exploration

The user must be able to drag the map.

Required:
- pointer drag
- touch drag
- constrained panning
- no document scroll during drag
- no accidental text selection
- no map loss beyond reachable bounds

Manual exploration must not destroy guided journey state.

## 8. Pan Boundaries

Panning must be constrained so the map cannot be dragged completely away.

Recommended:
- at least 15–25% of the map remains visible
- viewport never shows only empty background
- bounds recalculate on resize and orientation change

## 9. Recenter Behavior

Provide a compact recenter action:
- return to current station
- return to Overview
- continue guided journey

## 10. Station Coordinates

Station placement remains data-driven.

Recommended type:

```ts
type JourneyStation = {
  id: string
  order: number
  title: string
  shortTitle?: string
  summary?: string
  x: number
  y: number
  regionId: string
  landmarkType: string
  technologyLevel: number
  labelPosition: "top" | "right" | "bottom" | "left"
  hoverTitleLines?: string[]
  mobileFocusOffsetX?: number
  mobileFocusOffsetY?: number
  desktopFocusOffsetX?: number
  desktopFocusOffsetY?: number
}
```

## 11. Hover / Focus Titles

Desktop:
- hover station
- show large handwritten title above landmark
- reveal line by line

Mobile:
- tap/focus station
- show readable title

The title must adapt near viewport edges.

## 12. Guided Journey Layout

When Guided Journey is active:
- current station is focused
- map remains full-screen
- no left blank panel
- title and summary use safe top overlay
- Continue and Overview remain visible
- station click opens details
- no permanent Details button

## 13. Modal State Preservation

Opening a station detail modal must not modify:
- current station
- map scale
- map translation
- guided mode
- control visibility
- progress state

On close:
- restore focus to the station
- restore Continue and Overview
- keep journey active
- do not reset to the first station

## 14. Mobile Rules

Verify:
- full-screen map
- collapsed menu
- no horizontal overflow
- drag support
- stable controls
- bottom sheet details
- journey controls restored after close

## 15. Layer Structure

```text
RoadmapViewport
├── MapTransformLayer
│   ├── LeatherPaperSurface
│   ├── WrinkleLayer
│   ├── RouteLayer
│   ├── LandmarkLayer
│   ├── TechnologyAnnotationLayer
│   └── StationLabelLayer
├── CollapsedMenuControl
├── NavigationDrawer
├── IntroOrCurrentStationOverlay
├── JourneyControls
├── StationDetailOverlay
└── RecenterControl
```

## 16. Acceptance Criteria

1. The map covers the entire viewport.
2. No inset paper edges are visible.
3. Navigation is collapsed by default.
4. The map can be dragged.
5. Dragging is constrained.
6. Intro text never overlaps navigation.
7. Controls remain visible after modal close.
8. Station click opens details.
9. No permanent Details button exists.
10. Hover titles are readable and line-by-line.
11. Movement is slower than the current implementation.
12. Mobile remains fully usable.
