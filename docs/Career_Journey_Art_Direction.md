# Career_Journey_Art_Direction.md

## Project
AI Career OS — Career Workspace — Roadmap Art Direction

## Status
Approved Revision — Replaces Previous Version

## 1. Core Direction

### The Full-Screen Hand-Drawn Treasure Map

The Roadmap must feel like an enormous old treasure map or leather-paper surface extending beyond the viewport.

The user should feel that the visible screen is only one window into a much larger map.

The design must feel:
- lightweight
- premium
- hand-drawn
- exploratory
- readable
- mature
- AI-oriented
- mobile-first

It must not feel:
- game-like
- cinematic
- 3D
- card-based
- dashboard-like
- like a framed image placed inside a page

## 2. Career Entry Transition

When a user selects a career node on the Landing Page:

1. the camera must zoom fully into the selected node
2. the selected node must expand until it visually fills the viewport
3. the Career Workspace must remain hidden during the zoom
4. only after the node has visually taken over the viewport may the Career Workspace appear
5. the Landing Page and Career Workspace must never be visibly rendered together
6. the transition must use one controlled handoff state

The current overlapping-state behavior is not acceptable.

## 3. Paper / Leather Surface

The Roadmap background should feel like:
- old paper
- parchment
- soft leather-paper
- treasure-map material
- slightly worn
- subtly wrinkled
- uneven in tone

The entire viewport must be filled.

Do not show:
- a visible paper card
- framed page edges
- white outer margins
- empty page background around the map
- a large left-side dead area

The map surface should continue beyond the viewport.

Use:
- subtle grain
- low-contrast wrinkles
- light crease lines
- soft tonal variation
- muted beige / warm tan / faded leather tones

Avoid:
- large scanned textures
- dark grunge
- burnt edges
- pirate clichés
- heavy bitmap backgrounds

## 4. Full-Screen Map Composition

Default state:
- navigation collapsed
- map visible across the full viewport
- no permanent left panel
- no visible paper frame
- no empty unused region

The map must feel much larger than the monitor.

The user must be able to:
- drag the map
- pan freely
- explore any area
- return to the current station
- continue the guided journey after manual exploration

## 5. Navigation Presentation

The left navigation must be collapsed by default.

Default:
- only a compact edge control or arrow is visible
- the map uses the full screen width
- the menu does not reserve permanent layout width

When opened:
- the menu slides in over the map
- the map remains visible
- the panel is lightweight and semi-transparent
- closing the menu restores the full map

## 6. Hero / Roadmap Intro Copy

The Roadmap intro title and description must never overlap the navigation.

They must:
- stay inside a safe map content area
- adapt when the menu opens or closes
- remain readable on mobile and desktop
- avoid covering important stations

## 7. Landmark Style

Each station must use:
- minimal pencil sketch
- simple silhouette
- low detail
- restrained line weight
- clear identity
- lightweight SVG

Do not use:
- detailed scenery
- glossy pins
- heavy architectural illustrations
- game level markers
- large filled icons

## 8. Hover Title Behavior

When the user hovers a station on desktop:

1. a larger readable title appears directly above the station
2. the title writes on using a handwritten-style reveal
3. the reveal must happen line by line
4. the title must not animate as one giant horizontal wipe
5. the title must remain readable
6. the effect must be brief and lightweight

On mobile:
- use tap/focus instead of hover
- do not depend on hover for essential information

## 9. Minimal UI

Visible UI inside the Roadmap should be limited to:
- collapsed navigation control
- station hover/focus title
- current station title and summary
- Continue
- Overview
- temporary station modal or bottom sheet
- optional recenter control

Do not show a permanent Details button.

Station details should open by clicking or tapping the station itself.

## 10. Performance Direction

Use:
- SVG
- CSS
- reusable vector symbols
- small texture asset or procedural texture
- transform-based map movement
- minimal animation
- one primary map transform layer

Avoid:
- WebGL
- Three.js
- heavy Canvas
- giant bitmap map
- continuous animated grain
- complex blur
- particle effects

## 11. Acceptance Criteria

1. The Landing Page and Career Workspace never visibly overlap.
2. The selected node fully zooms before the Career Workspace appears.
3. The Roadmap fills the viewport.
4. No inset paper edges are visible.
5. Navigation is collapsed by default.
6. Intro title and description never overlap navigation.
7. The map can be freely dragged and explored.
8. Station hover titles appear above stations.
9. Hover titles reveal line by line.
10. Station click opens details.
11. No separate Details button is required.
12. Closing details preserves the journey and controls.
13. Movement feels slower and more spatial.
14. The map remains lightweight and mobile-friendly.
