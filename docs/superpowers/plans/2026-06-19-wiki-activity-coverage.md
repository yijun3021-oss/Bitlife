# Wiki Activity Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lightweight, clickable activities that cover the main BitLife Wiki activity menu categories missing from the current P0 game.

**Architecture:** Keep the current data-driven activity model. Add missing activities to `src/content/activities.ts`, localize them in `src/i18n/locales/en-US.ts` and `src/i18n/locales/zh-CN.ts`, and verify through unit/UI tests that representative wiki categories appear and can run.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Zustand.

---

### Task 1: Wiki Activity Coverage Tests

**Files:**
- Modify: `src/ui/App.test.tsx`
- Modify: `src/content/activities.ts`

- [ ] Add a test that checks adult activities include representative Wiki menu categories: Adoption, Casino, Horse Races, Lottery, Love, Licenses, Movie Theater, Nightlife, Salon & Spa, Vacation, and Will.
- [ ] Add a test that checks child/teen activities include age-appropriate Wiki categories: Movie Theater, Walks, Martial Arts, Book, and Identity.
- [ ] Run `node node_modules/vitest/vitest.mjs run src/ui/App.test.tsx --passWithNoTests` and confirm the new tests fail because activities are missing.

### Task 2: Activity Data

**Files:**
- Modify: `src/content/activities.ts`

- [ ] Add lightweight activity entries for missing Wiki categories with `id`, `titleKey`, `summaryKey`, `resultKey`, `minAge`, `cost`, `icon`, and effects.
- [ ] Keep complex systems as single-click placeholders with meaningful effects rather than new panels.

### Task 3: Localization

**Files:**
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/i18n/locales/zh-CN.ts`

- [ ] Add title, summary, and result keys for every new activity.
- [ ] Use original wording inspired by the Wiki categories without copying Wiki text.

### Task 4: Verification

**Files:**
- Test: `src/ui/App.test.tsx`
- Test: all existing tests

- [ ] Run the targeted UI tests and confirm they pass.
- [ ] Run the full Vitest suite.
- [ ] Run `tsc -b` and `vite build`.
- [ ] Restart the local Vite server on port 5173.
