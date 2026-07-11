# Career_Journey_Station_System.md

## Project
AI Career OS — Career Workspace — Career Journey Station System

## Status
Approved Revision — Replaces Previous Version

## 1. Core Principle

A station is:
- a minimal pencil landmark
- an interactive map location
- a direct entry point to station details

A station is not:
- a game node
- a card
- a detailed scene

## 2. Station Interaction Model

### Desktop

Hover:
- reveal a large readable handwritten title above the station
- reveal line by line
- strengthen landmark contrast slightly

Click:
- open station details
- preserve map and journey state

### Mobile

Tap:
- focus/select station
- open details when activated

Keyboard:
- focus reveals title
- Enter/Space opens details

## 3. Hover Title

The hover title must:
- appear above the station where possible
- use larger handwritten text
- remain readable
- avoid clipping
- reveal line by line
- not shift map layout

Preferred:
- one clipped reveal per line
- stagger approximately 80–160ms
- total duration approximately 350–700ms

## 4. Title Placement

Default:
- above station
- centered to landmark

Near top edge:
- place below station

Near side edge:
- offset inward

## 5. Required States

- locked
- available
- current
- completed

### Locked
- lighter graphite
- visible but inactive
- activation shows unlock reason

### Available
- normal contrast
- hover/focus title
- click opens details

### Current
- stronger line
- hand-drawn underline or circle
- subtle accent
- click opens details

### Completed
- small handwritten check
- slightly stronger completed route
- click opens details for review

## 6. Details Access

Remove the permanent `Details` button from Journey controls.

Station details should open through:
- station click
- station tap
- keyboard activation

Journey controls should contain:
- Continue
- Back where relevant
- Overview
- optional Recenter

## 7. Modal Preservation

When details open:
- keep current station unchanged
- keep current transform
- keep guided state
- keep controls stored
- prevent background document scroll

When details close:
- restore focus to station
- show Continue and Overview again
- do not restart the journey
- do not reset station index
- do not clear guided mode

## 8. Mobile Behavior

Use:
- visible compact label
- focus state on tap
- 44 × 44 minimum hit target
- bottom-sheet details
- title placement that avoids clipping

## 9. Accessibility

Use semantic buttons.

Accessible label example:

```text
Professional Tools, station 4 of 11, current. Open station details.
```

Restore focus after closing modal.

## 10. Acceptance Criteria

1. Hover reveals a readable title above the station.
2. Multi-line titles reveal line by line.
3. Click opens details.
4. No permanent Details button exists.
5. Closing details restores Journey controls.
6. Closing details does not reset the journey.
7. Station state remains unchanged.
8. Keyboard interaction works.
9. Mobile works without hover.
10. Landmarks remain minimal and lightweight.
