# Central Life Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the central gameplay area into a scrollable BitLife-style life timeline backed by the existing wiki-derived catalog/log data, while keeping the four core stats fixed together in the bottom HUD.

**Architecture:** Keep the current store and catalog systems. Add a focused `LifeTimeline` UI component that renders all `life.log` entries grouped by age and shows the pending yearly event as read-only context while choices still use `EventModal`. Keep `StatusBars` inside `.bottom-status-panel` and outside the scrolling `.screen-area`.

**Tech Stack:** React, TypeScript, Zustand store, Vitest + Testing Library, Vite, existing catalog files under `src/content/catalog/*`.

---

## File Structure

- Create `src/ui/LifeTimeline.tsx`: central timeline component for age header, pending event context, and full scrollable history.
- Modify `src/ui/Dashboard.tsx`: replace the old three-part dashboard card with `LifeTimeline`.
- Modify `src/styles.css`: add central timeline styles and remove/retire old dashboard spacing that conflicts.
- Modify `src/ui/App.p1.test.tsx`: update P1 layout tests for the new timeline contract.
- Modify `src/ui/App.test.tsx`: add behavior coverage that central history includes event, activity, relationship, and career logs.
- Modify `src/i18n/locales/en-US.ts` and `src/i18n/locales/zh-CN.ts`: add short labels only if the timeline needs a new visible heading.

## Task 1: Lock The Layout Contract With Tests

**Files:**
- Modify: `src/ui/App.p1.test.tsx`

- [ ] **Step 1: Replace the old three-in-one dashboard assertion with timeline layout assertions**

Use the existing `creates life` setup and assert:

```ts
const timeline = screen.getByRole('region', { name: /life timeline/i });
expect(timeline.closest('.screen-area')).not.toBeNull();
expect(timeline.closest('.bottom-status-panel')).toBeNull();
expect(timeline.querySelector('.life-timeline__entries')).not.toBeNull();
expect(timeline.querySelector('.event-panel')).not.toBeNull();

const statusBars = screen.getByRole('group', { name: /stats/i });
expect(statusBars.closest('.bottom-status-panel')).not.toBeNull();
expect(statusBars.closest('.life-timeline')).toBeNull();
```

- [ ] **Step 2: Add a history length assertion**

Create a life, resolve the birth event, age up repeatedly, resolving events when needed, then assert that `.life-timeline__entry` renders more than five entries. This proves the center no longer truncates to the old `slice(0, 5)` dashboard.

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/ui/App.p1.test.tsx`

Expected: fail because `Life Timeline` region and `.life-timeline__entries` do not exist yet.

## Task 2: Lock The Unified History Behavior With Tests

**Files:**
- Modify: `src/ui/App.test.tsx`

- [ ] **Step 1: Add a test for event and activity history**

Set up an adult life with `currentEvent: null`, run an activity such as `rest`, then assert the central timeline contains `You took time to rest.`. For event flow, create a new English life, choose the first event option, close the result modal, then assert the result text appears in `.life-timeline`.

- [ ] **Step 2: Add a test for relationship and career history**

Use existing helper `makeLife`, interact with a mother relationship, then assert `.life-timeline` contains `You talked with`. Set an adult life with no current event and apply for `career.cashier`, then assert the central timeline contains `You accepted a new job.`

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/ui/App.test.tsx`

Expected: at least one assertion fails because central history is still split/truncated by the old dashboard.

## Task 3: Implement `LifeTimeline`

**Files:**
- Create: `src/ui/LifeTimeline.tsx`
- Modify: `src/ui/Dashboard.tsx`

- [ ] **Step 1: Create grouped timeline component**

Implement:

```ts
interface LifeTimelineProps {
  life: LifeStateV2;
  onChoose(choiceId: string): void;
}
```

Behavior:
- `role="region"` and `aria-label={translate(locale, 'ui.label.lifeTimeline')}`.
- Top area shows current `Age: N years`.
- Pending event uses `<EventCard interactive={false} />`.
- History renders every `life.log` entry, grouped by `entry.age`.
- Each entry uses `translate(locale, entry.textKey, entry.values)`.
- Newest entries stay first because `life.log` is already newest-first.

- [ ] **Step 2: Wire Dashboard to the new component**

Make `Dashboard` return a wrapper containing only `<LifeTimeline life={life} onChoose={onChoose} />`.

- [ ] **Step 3: Add locale labels**

Add:

```ts
'ui.label.lifeTimeline': 'Life timeline'
```

and Chinese equivalent:

```ts
'ui.label.lifeTimeline': '人生时间线'
```

## Task 4: Style The Central Timeline

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Make center scroll-friendly**

Keep `.screen-area` as the only vertical scroll container. Style `.life-dashboard` and `.life-timeline` so the central area fills width without nesting cards inside cards.

- [ ] **Step 2: Add timeline entry styling**

Use compact age badges, dark central background, readable white text, and subtle separators. Do not move `.bottom-hud`, `.bottom-status-panel`, or `.status-bars`.

- [ ] **Step 3: Preserve reference-driven event modal behavior**

Ensure `.event-modal-backdrop` still has z-index above `.bottom-hud`, and the pending event remains visible only as read-only timeline context behind the modal.

## Task 5: Verify And Commit

**Files:**
- All changed files above.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
npm test -- src/ui/App.p1.test.tsx src/ui/App.test.tsx
```

Expected: all targeted tests pass.

- [ ] **Step 2: Run full tests and build**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and build exits 0. Existing chunk-size warning may remain.

- [ ] **Step 3: Browser QA**

Use Browser plugin if available; otherwise use Playwright with Edge. Verify:
- app loads at local Vite URL;
- creating life shows event modal over timeline;
- choosing event writes result into central timeline;
- running an activity writes result into central timeline;
- bottom four stats stay fixed while central content scrolls.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-06-21-central-life-timeline.md src
git commit -m "feat: rebuild central life timeline"
```

## Self-Review

- Spec coverage: central region rebuild, wiki/catalog-backed content, fixed core stats, unified history, and scrollable past history are each represented by tests and implementation tasks.
- Placeholder scan: no unfinished marker language remains.
- Type consistency: the plan uses existing `LifeStateV2`, `EventCard`, `StatusBars`, `life.log`, and locale APIs.
