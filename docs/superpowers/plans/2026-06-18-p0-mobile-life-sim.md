# P0 Mobile Life Sim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the P0-M mobile-first, multilingual, single-save life simulation PWA described in `docs/superpowers/specs/2026-06-18-p0-mobile-life-sim-design.md`.

**Architecture:** The app is a React/Vite PWA with a pure TypeScript game engine, a Zustand store for the single active life, JSON-like TypeScript seed data, and locale dictionaries for `zh-CN` and `en-US`. UI calls store actions; store actions call the engine; the engine returns state changes and log entries.

**Tech Stack:** React, TypeScript, Vite, Zustand, Vitest, Testing Library, jsdom, localStorage, CSS modules or plain CSS, PWA manifest.

---

## File Structure

Create this project structure under `C:\Users\Admin\Documents\bitliffe`:

```text
package.json
index.html
tsconfig.json
tsconfig.node.json
vite.config.ts
public/manifest.webmanifest
src/main.tsx
src/App.tsx
src/styles.css
src/vite-env.d.ts
src/content/activities.ts
src/content/countries.ts
src/content/events.ts
src/content/jobs.ts
src/content/names.ts
src/game/engine.ts
src/game/random.ts
src/game/types.ts
src/i18n/index.ts
src/i18n/locales/en-US.ts
src/i18n/locales/zh-CN.ts
src/store/lifeStore.ts
src/ui/ActivityPanel.tsx
src/ui/CreateLife.tsx
src/ui/Dashboard.tsx
src/ui/DeathSummary.tsx
src/ui/EventCard.tsx
src/ui/RelationshipsPanel.tsx
src/ui/SchoolWorkPanel.tsx
src/ui/StatusBars.tsx
src/ui/Tabs.tsx
src/test/setup.ts
src/game/engine.test.ts
src/i18n/i18n.test.ts
src/store/lifeStore.test.ts
src/ui/App.test.tsx
```

Boundary decisions:

- `src/game/*` contains no React imports and can be tested as pure logic.
- `src/content/*` contains static data, text keys, and numeric tuning.
- `src/i18n/*` resolves text keys and stores locale resources.
- `src/store/lifeStore.ts` is the only place that reads and writes localStorage.
- `src/ui/*` renders mobile-first UI and calls store actions.

## Task 1: Scaffold Vite React Project

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/vite-env.d.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create package and toolchain files**

Create `package.json`:

```json
{
  "name": "bitliffe",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vitest": "^2.1.8"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

- [ ] **Step 2: Create the initial HTML and React entry**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#f5f7fb" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <title>Bitliffe</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">P0</p>
        <h1>Bitliffe</h1>
        <p>Mobile life simulation prototype</p>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #1b2430;
  background: #eef2f7;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
select {
  font: inherit;
}

.app-shell {
  width: min(100vw, 430px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 16px;
  background: #f8fafc;
}

.panel {
  border: 1px solid #d8e0ec;
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #5b6b82;
  font-size: 12px;
  text-transform: uppercase;
}
```

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Install dependencies**

Run:

```powershell
npm install
```

Expected: `node_modules` and `package-lock.json` are created.

- [ ] **Step 4: Verify scaffold builds and tests**

Run:

```powershell
npm run build
npm test
```

Expected: build succeeds and Vitest exits with no test files or zero failing tests.

- [ ] **Step 5: Commit scaffold**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts src
& 'C:\Program Files\Git\cmd\git.exe' commit -m "chore: scaffold mobile life sim app"
```

## Task 2: Define Domain Types and Random Utilities

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/random.ts`
- Create: `src/game/engine.test.ts`

- [ ] **Step 1: Write tests for attribute clamping and random picking**

Create `src/game/engine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { clampAttribute } from './engine';
import { createSeededRandom, pickWeighted } from './random';

describe('game primitives', () => {
  it('clamps attributes into the 0-100 range', () => {
    expect(clampAttribute(-10)).toBe(0);
    expect(clampAttribute(44)).toBe(44);
    expect(clampAttribute(140)).toBe(100);
  });

  it('picks weighted items deterministically with a seeded random source', () => {
    const random = createSeededRandom(7);
    const item = pickWeighted(
      [
        { item: 'a', weight: 0 },
        { item: 'b', weight: 10 },
      ],
      random,
    );
    expect(item).toBe('b');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/game/engine.test.ts
```

Expected: FAIL because `src/game/engine.ts` and `src/game/random.ts` do not exist.

- [ ] **Step 3: Add domain types**

Create `src/game/types.ts`:

```ts
export type LocaleCode = 'zh-CN' | 'en-US';
export type Gender = 'female' | 'male' | 'non_binary';
export type LifeStage = 'infant' | 'child' | 'teen' | 'adult' | 'elder';
export type RelationshipType = 'mother' | 'father' | 'sibling';
export type SchoolStage = 'none' | 'elementary' | 'middle' | 'finished';

export interface AttributeState {
  happiness: number;
  health: number;
  smarts: number;
  looks: number;
}

export interface Character {
  id: string;
  name: string;
  gender: Gender;
  countryId: string;
  age: number;
  alive: boolean;
  attributes: AttributeState;
  money: number;
}

export interface Relationship {
  id: string;
  name: string;
  type: RelationshipType;
  closeness: number;
  alive: boolean;
}

export interface SchoolState {
  stage: SchoolStage;
  grade: number;
  stress: number;
}

export interface JobState {
  jobId: string;
  titleKey: string;
  salary: number;
  years: number;
}

export interface LifeLogEntry {
  id: string;
  age: number;
  textKey: string;
  values?: Record<string, string | number>;
}

export interface Effect {
  attributes?: Partial<AttributeState>;
  money?: number;
  relationship?: {
    type: RelationshipType;
    closeness: number;
  };
  addStatus?: string;
  removeStatus?: string;
}

export interface EventChoice {
  id: string;
  textKey: string;
  resultKey: string;
  effects: Effect;
}

export interface LifeEvent {
  id: string;
  textKey: string;
  minAge: number;
  maxAge: number;
  weight: number;
  tags: string[];
  requires?: {
    schoolStage?: SchoolStage;
    hasJob?: boolean;
  };
  choices: EventChoice[];
}

export interface DeathSummary {
  age: number;
  causeKey: string;
  netWorth: number;
  logKey: string;
}

export interface LifeState {
  version: 1;
  locale: LocaleCode;
  character: Character;
  relationships: Relationship[];
  school: SchoolState;
  job: JobState | null;
  statuses: string[];
  currentEvent: LifeEvent | null;
  log: LifeLogEntry[];
  deathSummary: DeathSummary | null;
}
```

- [ ] **Step 4: Add random utilities and minimal engine export**

Create `src/game/random.ts`:

```ts
export interface RandomSource {
  next(): number;
}

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    },
  };
}

export function pickWeighted<T>(items: Array<{ item: T; weight: number }>, random: RandomSource): T {
  const validItems = items.filter((entry) => entry.weight > 0);
  if (validItems.length === 0) {
    throw new Error('pickWeighted requires at least one item with positive weight');
  }
  const total = validItems.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random.next() * total;
  for (const entry of validItems) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.item;
    }
  }
  return validItems[validItems.length - 1].item;
}
```

Create `src/game/engine.ts`:

```ts
export function clampAttribute(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```powershell
npm test -- src/game/engine.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit domain primitives**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/game
& 'C:\Program Files\Git\cmd\git.exe' commit -m "feat: add life sim domain primitives"
```

## Task 3: Add Multilingual Text System

**Files:**
- Create: `src/i18n/index.ts`
- Create: `src/i18n/locales/zh-CN.ts`
- Create: `src/i18n/locales/en-US.ts`
- Create: `src/i18n/i18n.test.ts`

- [ ] **Step 1: Write failing i18n tests**

Create `src/i18n/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { translate } from './index';

describe('i18n', () => {
  it('translates known keys in Simplified Chinese', () => {
    expect(translate('zh-CN', 'ui.action.ageUp')).toBe('长大一岁');
  });

  it('translates known keys in English', () => {
    expect(translate('en-US', 'ui.action.ageUp')).toBe('Age up');
  });

  it('interpolates values', () => {
    expect(translate('en-US', 'log.birth', { name: 'Mina' })).toBe('Mina was born.');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/i18n/i18n.test.ts
```

Expected: FAIL because locale files do not exist.

- [ ] **Step 3: Add locale resources**

Create `src/i18n/locales/zh-CN.ts`:

```ts
export const zhCN = {
  'ui.appName': 'Bitliffe',
  'ui.action.ageUp': '长大一岁',
  'ui.action.newLife': '开始新人生',
  'ui.action.continueLife': '继续人生',
  'ui.action.createLife': '创建人生',
  'ui.action.choose': '选择',
  'ui.action.rest': '休息',
  'ui.action.study': '学习',
  'ui.action.familyTime': '陪伴家人',
  'ui.action.doctorVisit': '看医生',
  'ui.action.findJob': '找工作',
  'ui.tab.life': '人生',
  'ui.tab.relationships': '关系',
  'ui.tab.schoolWork': '学校/工作',
  'ui.tab.activities': '活动',
  'ui.tab.profile': '档案',
  'ui.stat.happiness': '幸福',
  'ui.stat.health': '健康',
  'ui.stat.smarts': '智力',
  'ui.stat.looks': '外貌',
  'ui.label.age': '年龄',
  'ui.label.money': '现金',
  'ui.label.country': '国家',
  'ui.label.currentEvent': '今年事件',
  'ui.label.lifeLog': '人生记录',
  'ui.label.relationships': '家庭关系',
  'ui.label.school': '学校',
  'ui.label.work': '工作',
  'ui.label.deathSummary': '人生结算',
  'log.birth': '{name} 出生了。',
  'log.ageUp': '{name} 长到了 {age} 岁。',
  'log.salary': '你从工作中获得了 {amount} 元。',
  'log.death': '你在 {age} 岁时去世了。',
  'event.birth.sunny.text': '你在一个普通却温暖的早晨来到这个世界。',
  'event.birth.sunny.choice.calm': '安静地观察世界',
  'event.birth.sunny.result.calm': '家人觉得你是个安稳的小孩。',
  'event.child.book.text': '你发现了一本图画书，里面有很多你不认识的字。',
  'event.child.book.choice.read': '努力读完它',
  'event.child.book.result.read': '你开始喜欢学习。',
  'event.school.test.text': '老师宣布明天有一次小测验。',
  'event.school.test.choice.study': '认真复习',
  'event.school.test.result.study': '你考得不错，也更有信心了。',
  'event.family.meal.text': '家人今晚难得一起吃饭。',
  'event.family.meal.choice.talk': '主动聊天',
  'event.family.meal.result.talk': '家里的气氛变好了。',
  'event.adult.walk.text': '你下班后路过一座安静的小公园。',
  'event.adult.walk.choice.walk': '散步放松',
  'event.adult.walk.result.walk': '你的心情和身体都轻松了一点。',
  'event.work.rush.text': '今天工作突然变得很忙。',
  'event.work.rush.choice.focus': '专心处理',
  'event.work.rush.result.focus': '你完成了任务，但有点疲惫。',
  'event.money.wallet.text': '你在路边捡到一个钱包。',
  'event.money.wallet.choice.return': '交给附近的工作人员',
  'event.money.wallet.result.return': '你没有拿到钱，但心里很踏实。',
  'death.oldAge': '自然老去',
  'death.poorHealth': '长期健康恶化',
  'death.accident': '意外事故',
} as const;
```

Create `src/i18n/locales/en-US.ts`:

```ts
export const enUS = {
  'ui.appName': 'Bitliffe',
  'ui.action.ageUp': 'Age up',
  'ui.action.newLife': 'Start new life',
  'ui.action.continueLife': 'Continue life',
  'ui.action.createLife': 'Create life',
  'ui.action.choose': 'Choose',
  'ui.action.rest': 'Rest',
  'ui.action.study': 'Study',
  'ui.action.familyTime': 'Spend family time',
  'ui.action.doctorVisit': 'Visit doctor',
  'ui.action.findJob': 'Find job',
  'ui.tab.life': 'Life',
  'ui.tab.relationships': 'Relationships',
  'ui.tab.schoolWork': 'School/Work',
  'ui.tab.activities': 'Activities',
  'ui.tab.profile': 'Profile',
  'ui.stat.happiness': 'Happiness',
  'ui.stat.health': 'Health',
  'ui.stat.smarts': 'Smarts',
  'ui.stat.looks': 'Looks',
  'ui.label.age': 'Age',
  'ui.label.money': 'Cash',
  'ui.label.country': 'Country',
  'ui.label.currentEvent': 'This year',
  'ui.label.lifeLog': 'Life log',
  'ui.label.relationships': 'Family',
  'ui.label.school': 'School',
  'ui.label.work': 'Work',
  'ui.label.deathSummary': 'Life summary',
  'log.birth': '{name} was born.',
  'log.ageUp': '{name} turned {age}.',
  'log.salary': 'You earned {amount} from work.',
  'log.death': 'You died at age {age}.',
  'event.birth.sunny.text': 'You arrived in the world on an ordinary, warm morning.',
  'event.birth.sunny.choice.calm': 'Quietly observe the world',
  'event.birth.sunny.result.calm': 'Your family thinks you are a calm child.',
  'event.child.book.text': 'You find a picture book filled with words you do not know yet.',
  'event.child.book.choice.read': 'Try to read it',
  'event.child.book.result.read': 'You start enjoying learning.',
  'event.school.test.text': 'Your teacher announces a quiz for tomorrow.',
  'event.school.test.choice.study': 'Study carefully',
  'event.school.test.result.study': 'You do well and feel more confident.',
  'event.family.meal.text': 'Your family sits down for dinner together.',
  'event.family.meal.choice.talk': 'Start a conversation',
  'event.family.meal.result.talk': 'The mood at home improves.',
  'event.adult.walk.text': 'After work, you pass a quiet little park.',
  'event.adult.walk.choice.walk': 'Take a relaxing walk',
  'event.adult.walk.result.walk': 'Your mind and body feel lighter.',
  'event.work.rush.text': 'Work suddenly gets very busy today.',
  'event.work.rush.choice.focus': 'Focus on the tasks',
  'event.work.rush.result.focus': 'You finish the work, but feel tired.',
  'event.money.wallet.text': 'You find a wallet on the sidewalk.',
  'event.money.wallet.choice.return': 'Give it to nearby staff',
  'event.money.wallet.result.return': 'You do not get money, but you feel at peace.',
  'death.oldAge': 'old age',
  'death.poorHealth': 'declining health',
  'death.accident': 'an accident',
} as const;
```

- [ ] **Step 4: Add translation helper**

Create `src/i18n/index.ts`:

```ts
import type { LocaleCode } from '../game/types';
import { enUS } from './locales/en-US';
import { zhCN } from './locales/zh-CN';

const dictionaries = {
  'zh-CN': zhCN,
  'en-US': enUS,
} as const;

export type TextKey = keyof typeof zhCN;

export function translate(
  locale: LocaleCode,
  key: string,
  values: Record<string, string | number> = {},
): string {
  const dictionary = dictionaries[locale] as Record<string, string>;
  const fallback = dictionaries['en-US'] as Record<string, string>;
  const template = dictionary[key] ?? fallback[key] ?? key;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}
```

- [ ] **Step 5: Run i18n tests**

Run:

```powershell
npm test -- src/i18n/i18n.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit i18n**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/i18n
& 'C:\Program Files\Git\cmd\git.exe' commit -m "feat: add multilingual text system"
```

## Task 4: Add Seed Content Config

**Files:**
- Create: `src/content/countries.ts`
- Create: `src/content/names.ts`
- Create: `src/content/jobs.ts`
- Create: `src/content/activities.ts`
- Create: `src/content/events.ts`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/game/engine.test.ts`

- [ ] **Step 1: Add content shape tests**

Append to `src/game/engine.test.ts`:

```ts
import { events } from '../content/events';
import { jobs } from '../content/jobs';

describe('seed content', () => {
  it('ships enough original P0 events for the first playable loop', () => {
    expect(events.length).toBeGreaterThanOrEqual(24);
    expect(events.every((event) => event.choices.length >= 1)).toBe(true);
  });

  it('ships ordinary jobs for adult gameplay', () => {
    expect(jobs.map((job) => job.id)).toEqual([
      'cashier',
      'office_assistant',
      'cook',
      'driver',
      'support_agent',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/game/engine.test.ts
```

Expected: FAIL because content files do not exist.

- [ ] **Step 3: Create countries and names**

Create `src/content/countries.ts`:

```ts
export const countries = [
  { id: 'cn', nameKey: 'country.cn', currency: 'CNY' },
  { id: 'us', nameKey: 'country.us', currency: 'USD' },
  { id: 'jp', nameKey: 'country.jp', currency: 'JPY' },
] as const;
```

Create `src/content/names.ts`:

```ts
export const givenNames = ['Mina', 'Alex', 'Rin', 'Leo', 'Nora', 'Kai', 'Ivy', 'Sam'] as const;
export const familyNames = ['Lin', 'Chen', 'Rivera', 'Stone', 'Morgan', 'Tanaka', 'Park', 'Wong'] as const;
```

- [ ] **Step 4: Create job and activity config**

Create `src/content/jobs.ts`:

```ts
export const jobs = [
  { id: 'cashier', titleKey: 'job.cashier', salary: 18000, smartsMin: 0 },
  { id: 'office_assistant', titleKey: 'job.officeAssistant', salary: 26000, smartsMin: 35 },
  { id: 'cook', titleKey: 'job.cook', salary: 24000, smartsMin: 20 },
  { id: 'driver', titleKey: 'job.driver', salary: 28000, smartsMin: 20 },
  { id: 'support_agent', titleKey: 'job.supportAgent', salary: 30000, smartsMin: 40 },
] as const;
```

Create `src/content/activities.ts`:

```ts
import type { Effect } from '../game/types';

export interface ActivityConfig {
  id: string;
  titleKey: string;
  minAge: number;
  effects: Effect;
}

export const activities: ActivityConfig[] = [
  { id: 'rest', titleKey: 'ui.action.rest', minAge: 0, effects: { attributes: { health: 6, happiness: 2 } } },
  { id: 'study', titleKey: 'ui.action.study', minAge: 6, effects: { attributes: { smarts: 5, happiness: -2 } } },
  { id: 'family_time', titleKey: 'ui.action.familyTime', minAge: 0, effects: { attributes: { happiness: 4 }, relationship: { type: 'mother', closeness: 4 } } },
  { id: 'doctor_visit', titleKey: 'ui.action.doctorVisit', minAge: 0, effects: { attributes: { health: 12 }, money: -200 } },
  { id: 'find_job', titleKey: 'ui.action.findJob', minAge: 18, effects: {} },
];
```

- [ ] **Step 5: Create initial event config**

Create `src/content/events.ts`:

```ts
import type { LifeEvent } from '../game/types';

export const events: LifeEvent[] = [
  {
    id: 'birth_sunny',
    textKey: 'event.birth.sunny.text',
    minAge: 0,
    maxAge: 1,
    weight: 10,
    tags: ['birth'],
    choices: [
      {
        id: 'calm',
        textKey: 'event.birth.sunny.choice.calm',
        resultKey: 'event.birth.sunny.result.calm',
        effects: { attributes: { happiness: 2 } },
      },
    ],
  },
  {
    id: 'child_book',
    textKey: 'event.child.book.text',
    minAge: 3,
    maxAge: 10,
    weight: 10,
    tags: ['child'],
    choices: [
      {
        id: 'read',
        textKey: 'event.child.book.choice.read',
        resultKey: 'event.child.book.result.read',
        effects: { attributes: { smarts: 5, happiness: 1 } },
      },
    ],
  },
  {
    id: 'school_test',
    textKey: 'event.school.test.text',
    minAge: 6,
    maxAge: 17,
    weight: 10,
    tags: ['school'],
    requires: { schoolStage: 'elementary' },
    choices: [
      {
        id: 'study',
        textKey: 'event.school.test.choice.study',
        resultKey: 'event.school.test.result.study',
        effects: { attributes: { smarts: 4, happiness: -1 } },
      },
    ],
  },
  {
    id: 'family_meal',
    textKey: 'event.family.meal.text',
    minAge: 2,
    maxAge: 90,
    weight: 8,
    tags: ['family'],
    choices: [
      {
        id: 'talk',
        textKey: 'event.family.meal.choice.talk',
        resultKey: 'event.family.meal.result.talk',
        effects: { attributes: { happiness: 4 }, relationship: { type: 'mother', closeness: 3 } },
      },
    ],
  },
  {
    id: 'adult_walk',
    textKey: 'event.adult.walk.text',
    minAge: 18,
    maxAge: 75,
    weight: 7,
    tags: ['adult'],
    choices: [
      {
        id: 'walk',
        textKey: 'event.adult.walk.choice.walk',
        resultKey: 'event.adult.walk.result.walk',
        effects: { attributes: { happiness: 3, health: 2 } },
      },
    ],
  },
  {
    id: 'work_rush',
    textKey: 'event.work.rush.text',
    minAge: 18,
    maxAge: 75,
    weight: 8,
    tags: ['work'],
    requires: { hasJob: true },
    choices: [
      {
        id: 'focus',
        textKey: 'event.work.rush.choice.focus',
        resultKey: 'event.work.rush.result.focus',
        effects: { attributes: { smarts: 2, health: -3, happiness: -2 } },
      },
    ],
  },
  {
    id: 'money_wallet',
    textKey: 'event.money.wallet.text',
    minAge: 12,
    maxAge: 85,
    weight: 4,
    tags: ['money'],
    choices: [
      {
        id: 'return',
        textKey: 'event.money.wallet.choice.return',
        resultKey: 'event.money.wallet.result.return',
        effects: { attributes: { happiness: 3 } },
      },
    ],
  },
];
```

- [ ] **Step 6: Expand events to the first playable content floor**

Add more original events to `src/content/events.ts` until `events.length >= 24`. This is the first playable content floor, not the final P0-M content target. Use these exact event ids and categories so QA can verify coverage:

```text
birth_rainy
birth_busy_home
child_neighbor
child_lost_toy
child_tree_climb
school_group_project
school_bully_choice
school_art_day
school_sports_day
family_argument
family_sibling_game
family_parent_tired
adult_room_clean
adult_old_friend
adult_bad_sleep
work_kind_customer
work_mistake
work_extra_shift
money_small_bonus
money_broken_phone
health_minor_fever
health_knee_pain
elder_quiet_morning
elder_memory_box
```

Each added event must use original text keys and at least one choice. Add matching zh-CN and en-US keys in the locale files in the same commit.

- [ ] **Step 7: Add country and job locale keys**

Append these entries to both locale files with translated values:

```ts
'country.cn': '中国',
'country.us': '美国',
'country.jp': '日本',
'job.cashier': '收银员',
'job.officeAssistant': '办公室助理',
'job.cook': '厨师',
'job.driver': '司机',
'job.supportAgent': '客服专员',
```

For `en-US.ts`, use:

```ts
'country.cn': 'China',
'country.us': 'United States',
'country.jp': 'Japan',
'job.cashier': 'Cashier',
'job.officeAssistant': 'Office assistant',
'job.cook': 'Cook',
'job.driver': 'Driver',
'job.supportAgent': 'Support agent',
```

- [ ] **Step 8: Run content tests**

Run:

```powershell
npm test -- src/game/engine.test.ts src/i18n/i18n.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit seed content**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/content src/i18n src/game/engine.test.ts
& 'C:\Program Files\Git\cmd\git.exe' commit -m "feat: add p0 seed content"
```

## Task 5: Implement Core Game Engine

**Files:**
- Modify: `src/game/engine.ts`
- Modify: `src/game/engine.test.ts`

- [ ] **Step 1: Add engine behavior tests**

Append to `src/game/engine.test.ts`:

```ts
import { createNewLife, applyChoice, ageUp, calculateDeathRisk } from './engine';

describe('life engine', () => {
  it('creates a new life with family, school, log, and current event', () => {
    const life = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });

    expect(life.character.age).toBe(0);
    expect(life.character.alive).toBe(true);
    expect(life.relationships.map((person) => person.type)).toContain('mother');
    expect(life.relationships.map((person) => person.type)).toContain('father');
    expect(life.currentEvent).not.toBeNull();
    expect(life.log[0].textKey).toBe('log.birth');
  });

  it('applies choice effects and records the result', () => {
    const life = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });
    const choice = life.currentEvent?.choices[0];
    expect(choice).toBeDefined();

    const next = applyChoice(life, choice!.id);
    expect(next.log[0].textKey).toBe(choice!.resultKey);
  });

  it('ages up, pays salary, and updates school stage', () => {
    const life = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });
    const ageSix = Array.from({ length: 6 }).reduce((state) => ageUp(state as ReturnType<typeof createNewLife>, 1), life);
    expect(ageSix.character.age).toBe(6);
    expect(ageSix.school.stage).toBe('elementary');
  });

  it('raises death risk when health is low', () => {
    expect(calculateDeathRisk(30, 80, [])).toBeLessThan(calculateDeathRisk(30, 10, []));
    expect(calculateDeathRisk(82, 80, [])).toBeGreaterThan(calculateDeathRisk(30, 80, []));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/game/engine.test.ts
```

Expected: FAIL because engine functions are not implemented.

- [ ] **Step 3: Implement engine**

Replace `src/game/engine.ts` with:

```ts
import { events } from '../content/events';
import { jobs } from '../content/jobs';
import { familyNames, givenNames } from '../content/names';
import { createSeededRandom, pickWeighted, type RandomSource } from './random';
import type { AttributeState, Effect, EventChoice, Gender, LifeEvent, LifeLogEntry, LifeStage, LifeState, LocaleCode, Relationship, SchoolState } from './types';

export function clampAttribute(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function id(prefix: string, value: string | number): string {
  return `${prefix}_${value}`;
}

function pickName(random: RandomSource): string {
  const given = givenNames[Math.floor(random.next() * givenNames.length)];
  const family = familyNames[Math.floor(random.next() * familyNames.length)];
  return `${given} ${family}`;
}

export function getLifeStage(age: number): LifeStage {
  if (age < 3) return 'infant';
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  if (age < 65) return 'adult';
  return 'elder';
}

export function getSchoolState(age: number, previous?: SchoolState): SchoolState {
  if (age < 6) return { stage: 'none', grade: 0, stress: 0 };
  if (age < 13) return { stage: 'elementary', grade: age - 5, stress: previous?.stress ?? 10 };
  if (age < 18) return { stage: 'middle', grade: age - 12, stress: previous?.stress ?? 18 };
  return { stage: 'finished', grade: 12, stress: 0 };
}

function createAttributes(random: RandomSource): AttributeState {
  return {
    happiness: 55 + Math.floor(random.next() * 25),
    health: 55 + Math.floor(random.next() * 30),
    smarts: 35 + Math.floor(random.next() * 45),
    looks: 35 + Math.floor(random.next() * 45),
  };
}

function createFamily(random: RandomSource): Relationship[] {
  const relationships: Relationship[] = [
    { id: id('rel', 'mother'), name: pickName(random), type: 'mother', closeness: 55 + Math.floor(random.next() * 35), alive: true },
    { id: id('rel', 'father'), name: pickName(random), type: 'father', closeness: 45 + Math.floor(random.next() * 35), alive: true },
  ];
  if (random.next() > 0.45) {
    relationships.push({ id: id('rel', 'sibling'), name: pickName(random), type: 'sibling', closeness: 40 + Math.floor(random.next() * 40), alive: true });
  }
  return relationships;
}

function logEntry(age: number, textKey: string, values: Record<string, string | number> = {}): LifeLogEntry {
  return { id: `${Date.now()}_${age}_${textKey}_${Math.random().toString(16).slice(2)}`, age, textKey, values };
}

function eventMatches(life: LifeState, event: LifeEvent): boolean {
  const age = life.character.age;
  if (age < event.minAge || age > event.maxAge) return false;
  if (event.requires?.schoolStage && life.school.stage !== event.requires.schoolStage) return false;
  if (typeof event.requires?.hasJob === 'boolean' && Boolean(life.job) !== event.requires.hasJob) return false;
  return true;
}

export function pickNextEvent(life: LifeState, seed = life.character.age + life.log.length): LifeEvent | null {
  const matching = events.filter((event) => eventMatches(life, event));
  if (matching.length === 0) return null;
  return pickWeighted(
    matching.map((event) => ({ item: event, weight: event.weight })),
    createSeededRandom(seed),
  );
}

function applyEffect(life: LifeState, effect: Effect): LifeState {
  const attributes = { ...life.character.attributes };
  for (const [key, delta] of Object.entries(effect.attributes ?? {})) {
    const attr = key as keyof AttributeState;
    attributes[attr] = clampAttribute(attributes[attr] + Number(delta));
  }

  const relationships = life.relationships.map((relationship) => {
    if (effect.relationship && relationship.type === effect.relationship.type) {
      return { ...relationship, closeness: clampAttribute(relationship.closeness + effect.relationship.closeness) };
    }
    return relationship;
  });

  const statuses = new Set(life.statuses);
  if (effect.addStatus) statuses.add(effect.addStatus);
  if (effect.removeStatus) statuses.delete(effect.removeStatus);

  return {
    ...life,
    character: {
      ...life.character,
      attributes,
      money: life.character.money + (effect.money ?? 0),
    },
    relationships,
    statuses: Array.from(statuses),
  };
}

export function createNewLife(input: {
  name: string;
  gender: Gender;
  countryId: string;
  locale: LocaleCode;
  seed: number;
}): LifeState {
  const random = createSeededRandom(input.seed);
  const characterName = input.name.trim() || pickName(random);
  const base: LifeState = {
    version: 1,
    locale: input.locale,
    character: {
      id: id('character', input.seed),
      name: characterName,
      gender: input.gender,
      countryId: input.countryId,
      age: 0,
      alive: true,
      attributes: createAttributes(random),
      money: 0,
    },
    relationships: createFamily(random),
    school: getSchoolState(0),
    job: null,
    statuses: [],
    currentEvent: null,
    log: [logEntry(0, 'log.birth', { name: characterName })],
    deathSummary: null,
  };
  return { ...base, currentEvent: pickNextEvent(base, input.seed) };
}

export function applyChoice(life: LifeState, choiceId: string): LifeState {
  const event = life.currentEvent;
  const choice = event?.choices.find((item) => item.id === choiceId);
  if (!event || !choice || !life.character.alive) return life;
  const changed = applyEffect(life, choice.effects);
  return {
    ...changed,
    currentEvent: null,
    log: [logEntry(life.character.age, choice.resultKey), ...changed.log],
  };
}

export function calculateDeathRisk(age: number, health: number, statuses: string[]): number {
  const ageRisk = age < 55 ? 0 : Math.min(0.28, (age - 54) * 0.006);
  const healthRisk = health >= 40 ? 0 : (40 - health) * 0.006;
  const frailRisk = statuses.includes('frail') ? 0.08 : 0;
  const injuredRisk = statuses.includes('injured') ? 0.04 : 0;
  return Math.min(0.75, ageRisk + healthRisk + frailRisk + injuredRisk);
}

function maybeDie(life: LifeState, seed: number): LifeState {
  const risk = calculateDeathRisk(life.character.age, life.character.attributes.health, life.statuses);
  const random = createSeededRandom(seed);
  if (life.character.age < 45 && risk < 0.05) return life;
  if (random.next() > risk) return life;
  const causeKey = life.character.age > 78 ? 'death.oldAge' : life.character.attributes.health < 25 ? 'death.poorHealth' : 'death.accident';
  return {
    ...life,
    character: { ...life.character, alive: false },
    currentEvent: null,
    deathSummary: {
      age: life.character.age,
      causeKey,
      netWorth: life.character.money,
      logKey: 'log.death',
    },
    log: [logEntry(life.character.age, 'log.death', { age: life.character.age }), ...life.log],
  };
}

export function ageUp(life: LifeState, seed = life.character.age + 100): LifeState {
  if (!life.character.alive) return life;
  const age = life.character.age + 1;
  const salary = life.job ? Math.round(life.job.salary / 12) : 0;
  const aged: LifeState = {
    ...life,
    character: {
      ...life.character,
      age,
      money: life.character.money + salary,
    },
    school: getSchoolState(age, life.school),
    job: life.job ? { ...life.job, years: life.job.years + 1 } : null,
    log: [
      ...(salary > 0 ? [logEntry(age, 'log.salary', { amount: salary })] : []),
      logEntry(age, 'log.ageUp', { name: life.character.name, age }),
      ...life.log,
    ],
  };
  const deathChecked = maybeDie(aged, seed);
  if (!deathChecked.character.alive) return deathChecked;
  return { ...deathChecked, currentEvent: pickNextEvent(deathChecked, seed) };
}

export function findJob(life: LifeState): LifeState {
  if (life.character.age < 18 || life.job) return life;
  const available = jobs.filter((job) => life.character.attributes.smarts >= job.smartsMin);
  const job = available[0] ?? jobs[0];
  return {
    ...life,
    job: { jobId: job.id, titleKey: job.titleKey, salary: job.salary, years: 0 },
  };
}

export function applyActivity(life: LifeState, activityEffect: Effect): LifeState {
  if (!life.character.alive) return life;
  return applyEffect(life, activityEffect);
}
```

- [ ] **Step 4: Run engine tests**

Run:

```powershell
npm test -- src/game/engine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit engine**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/game
& 'C:\Program Files\Git\cmd\git.exe' commit -m "feat: implement p0 life engine"
```

## Task 6: Add Zustand Store and Single-Save Persistence

**Files:**
- Create: `src/store/lifeStore.ts`
- Create: `src/store/lifeStore.test.ts`

- [ ] **Step 1: Write store tests**

Create `src/store/lifeStore.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { SAVE_KEY, useLifeStore } from './lifeStore';

describe('life store', () => {
  beforeEach(() => {
    localStorage.clear();
    useLifeStore.setState(useLifeStore.getInitialState(), true);
  });

  it('creates and persists a single life', () => {
    useLifeStore.getState().createLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
    });
    expect(useLifeStore.getState().life?.character.name).toBe('Mina Lin');
    expect(localStorage.getItem(SAVE_KEY)).toContain('Mina Lin');
  });

  it('ages up the current life', () => {
    useLifeStore.getState().createLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
    });
    useLifeStore.getState().ageUpLife();
    expect(useLifeStore.getState().life?.character.age).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/store/lifeStore.test.ts
```

Expected: FAIL because store file does not exist.

- [ ] **Step 3: Implement store**

Create `src/store/lifeStore.ts`:

```ts
import { create } from 'zustand';
import { activities } from '../content/activities';
import { ageUp, applyActivity, applyChoice, createNewLife, findJob } from '../game/engine';
import type { Gender, LifeState, LocaleCode } from '../game/types';

export const SAVE_KEY = 'bitliffe.save.v1';

interface CreateLifeInput {
  name: string;
  gender: Gender;
  countryId: string;
}

interface LifeStore {
  locale: LocaleCode;
  life: LifeState | null;
  activeTab: 'life' | 'relationships' | 'schoolWork' | 'activities' | 'profile';
  createLife(input: CreateLifeInput): void;
  loadLife(): void;
  clearLife(): void;
  setLocale(locale: LocaleCode): void;
  setActiveTab(tab: LifeStore['activeTab']): void;
  ageUpLife(): void;
  chooseEvent(choiceId: string): void;
  runActivity(activityId: string): void;
}

function save(life: LifeState | null, locale: LocaleCode): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale, life }));
}

function readSave(): { locale: LocaleCode; life: LifeState | null } | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { version: number; locale: LocaleCode; life: LifeState | null };
    if (parsed.version !== 1) return null;
    return { locale: parsed.locale, life: parsed.life };
  } catch {
    return null;
  }
}

export const useLifeStore = create<LifeStore>((set, get) => ({
  locale: 'zh-CN',
  life: null,
  activeTab: 'life',
  createLife(input) {
    const locale = get().locale;
    const life = createNewLife({ ...input, locale, seed: Date.now() % 100000 });
    save(life, locale);
    set({ life, activeTab: 'life' });
  },
  loadLife() {
    const loaded = readSave();
    if (loaded) set({ locale: loaded.locale, life: loaded.life });
  },
  clearLife() {
    localStorage.removeItem(SAVE_KEY);
    set({ life: null, activeTab: 'life' });
  },
  setLocale(locale) {
    const life = get().life;
    const updatedLife = life ? { ...life, locale } : null;
    save(updatedLife, locale);
    set({ locale, life: updatedLife });
  },
  setActiveTab(activeTab) {
    set({ activeTab });
  },
  ageUpLife() {
    const life = get().life;
    if (!life) return;
    const next = ageUp(life);
    save(next, get().locale);
    set({ life: next, activeTab: next.character.alive ? 'life' : 'profile' });
  },
  chooseEvent(choiceId) {
    const life = get().life;
    if (!life) return;
    const next = applyChoice(life, choiceId);
    save(next, get().locale);
    set({ life: next });
  },
  runActivity(activityId) {
    const life = get().life;
    if (!life) return;
    if (activityId === 'find_job') {
      const next = findJob(life);
      save(next, get().locale);
      set({ life: next, activeTab: 'schoolWork' });
      return;
    }
    const activity = activities.find((item) => item.id === activityId);
    if (!activity || life.character.age < activity.minAge) return;
    const next = applyActivity(life, activity.effects);
    save(next, get().locale);
    set({ life: next });
  },
}));
```

- [ ] **Step 4: Run store tests**

Run:

```powershell
npm test -- src/store/lifeStore.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit store**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/store
& 'C:\Program Files\Git\cmd\git.exe' commit -m "feat: add single-save life store"
```

## Task 7: Build Mobile UI Components

**Files:**
- Create: `src/ui/StatusBars.tsx`
- Create: `src/ui/EventCard.tsx`
- Create: `src/ui/Tabs.tsx`
- Create: `src/ui/CreateLife.tsx`
- Create: `src/ui/Dashboard.tsx`
- Create: `src/ui/RelationshipsPanel.tsx`
- Create: `src/ui/SchoolWorkPanel.tsx`
- Create: `src/ui/ActivityPanel.tsx`
- Create: `src/ui/DeathSummary.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/ui/App.test.tsx`

- [ ] **Step 1: Write UI smoke test**

Create `src/ui/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { SAVE_KEY, useLifeStore } from '../store/lifeStore';

describe('App', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
  });

  it('creates a life and shows the dashboard', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText('姓名'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: '创建人生' }));
    expect(screen.getByText('Mina Lin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '长大一岁' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/ui/App.test.tsx
```

Expected: FAIL because the UI does not render the form yet.

- [ ] **Step 3: Create status and event components**

Create `src/ui/StatusBars.tsx`:

```tsx
import type { AttributeState } from '../game/types';
import { translate } from '../i18n';
import type { LocaleCode } from '../game/types';

const statKeys: Array<keyof AttributeState> = ['happiness', 'health', 'smarts', 'looks'];

export function StatusBars({ attributes, locale }: { attributes: AttributeState; locale: LocaleCode }) {
  return (
    <section className="grid-panel stats-grid">
      {statKeys.map((key) => (
        <div className="stat-row" key={key}>
          <span>{translate(locale, `ui.stat.${key}`)}</span>
          <strong>{attributes[key]}</strong>
          <div className="meter">
            <span style={{ width: `${attributes[key]}%` }} />
          </div>
        </div>
      ))}
    </section>
  );
}
```

Create `src/ui/EventCard.tsx`:

```tsx
import type { LifeEvent, LocaleCode } from '../game/types';
import { translate } from '../i18n';

export function EventCard({
  event,
  locale,
  onChoose,
}: {
  event: LifeEvent | null;
  locale: LocaleCode;
  onChoose(choiceId: string): void;
}) {
  if (!event) {
    return <section className="panel muted-panel">{translate(locale, 'ui.action.ageUp')}</section>;
  }
  return (
    <section className="panel event-card">
      <p className="eyebrow">{translate(locale, 'ui.label.currentEvent')}</p>
      <p>{translate(locale, event.textKey)}</p>
      <div className="button-stack">
        {event.choices.map((choice) => (
          <button key={choice.id} type="button" onClick={() => onChoose(choice.id)}>
            {translate(locale, choice.textKey)}
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create creation and dashboard components**

Create `src/ui/CreateLife.tsx`:

```tsx
import { useState } from 'react';
import type { Gender, LocaleCode } from '../game/types';
import { translate } from '../i18n';

export function CreateLife({
  locale,
  onCreate,
}: {
  locale: LocaleCode;
  onCreate(input: { name: string; gender: Gender; countryId: string }): void;
}) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [countryId, setCountryId] = useState('cn');

  return (
    <section className="panel create-panel">
      <p className="eyebrow">P0</p>
      <h1>{translate(locale, 'ui.appName')}</h1>
      <label>
        姓名
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Gender
        <select value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non_binary">Non-binary</option>
        </select>
      </label>
      <label>
        Country
        <select value={countryId} onChange={(event) => setCountryId(event.target.value)}>
          <option value="cn">China</option>
          <option value="us">United States</option>
          <option value="jp">Japan</option>
        </select>
      </label>
      <button type="button" onClick={() => onCreate({ name, gender, countryId })}>
        {translate(locale, 'ui.action.createLife')}
      </button>
    </section>
  );
}
```

Create `src/ui/Dashboard.tsx`:

```tsx
import type { LifeState } from '../game/types';
import { translate } from '../i18n';
import { EventCard } from './EventCard';
import { StatusBars } from './StatusBars';

export function Dashboard({
  life,
  onAgeUp,
  onChoose,
}: {
  life: LifeState;
  onAgeUp(): void;
  onChoose(choiceId: string): void;
}) {
  const locale = life.locale;
  return (
    <div className="screen-stack">
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">{translate(locale, 'ui.label.age')} {life.character.age}</p>
          <h1>{life.character.name}</h1>
          <p>{translate(locale, 'ui.label.money')}: {life.character.money}</p>
        </div>
        <button type="button" onClick={onAgeUp}>
          {translate(locale, 'ui.action.ageUp')}
        </button>
      </section>
      <StatusBars attributes={life.character.attributes} locale={locale} />
      <EventCard event={life.currentEvent} locale={locale} onChoose={onChoose} />
      <section className="panel">
        <p className="eyebrow">{translate(locale, 'ui.label.lifeLog')}</p>
        <ul className="life-log">
          {life.log.slice(0, 8).map((entry) => (
            <li key={entry.id}>{translate(locale, entry.textKey, entry.values)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Create panel components**

Create `src/ui/RelationshipsPanel.tsx`:

```tsx
import type { LifeState } from '../game/types';
import { translate } from '../i18n';

export function RelationshipsPanel({ life }: { life: LifeState }) {
  return (
    <section className="panel">
      <p className="eyebrow">{translate(life.locale, 'ui.label.relationships')}</p>
      {life.relationships.map((relationship) => (
        <div className="row" key={relationship.id}>
          <span>{relationship.name}</span>
          <strong>{relationship.closeness}</strong>
        </div>
      ))}
    </section>
  );
}
```

Create `src/ui/SchoolWorkPanel.tsx`:

```tsx
import type { LifeState } from '../game/types';
import { translate } from '../i18n';

export function SchoolWorkPanel({ life }: { life: LifeState }) {
  return (
    <div className="screen-stack">
      <section className="panel">
        <p className="eyebrow">{translate(life.locale, 'ui.label.school')}</p>
        <p>{life.school.stage} · Grade {life.school.grade} · Stress {life.school.stress}</p>
      </section>
      <section className="panel">
        <p className="eyebrow">{translate(life.locale, 'ui.label.work')}</p>
        <p>{life.job ? `${translate(life.locale, life.job.titleKey)} · ${life.job.salary}` : 'No job'}</p>
      </section>
    </div>
  );
}
```

Create `src/ui/ActivityPanel.tsx`:

```tsx
import { activities } from '../content/activities';
import type { LifeState } from '../game/types';
import { translate } from '../i18n';

export function ActivityPanel({ life, onRun }: { life: LifeState; onRun(activityId: string): void }) {
  return (
    <section className="panel">
      <p className="eyebrow">{translate(life.locale, 'ui.tab.activities')}</p>
      <div className="button-stack">
        {activities
          .filter((activity) => life.character.age >= activity.minAge)
          .map((activity) => (
            <button key={activity.id} type="button" onClick={() => onRun(activity.id)}>
              {translate(life.locale, activity.titleKey)}
            </button>
          ))}
      </div>
    </section>
  );
}
```

Create `src/ui/DeathSummary.tsx`:

```tsx
import type { LifeState } from '../game/types';
import { translate } from '../i18n';

export function DeathSummary({ life, onNewLife }: { life: LifeState; onNewLife(): void }) {
  const summary = life.deathSummary;
  if (!summary) return null;
  return (
    <section className="panel death-panel">
      <p className="eyebrow">{translate(life.locale, 'ui.label.deathSummary')}</p>
      <h1>{life.character.name}</h1>
      <p>{translate(life.locale, summary.logKey, { age: summary.age })}</p>
      <p>{translate(life.locale, summary.causeKey)}</p>
      <p>{translate(life.locale, 'ui.label.money')}: {summary.netWorth}</p>
      <button type="button" onClick={onNewLife}>
        {translate(life.locale, 'ui.action.newLife')}
      </button>
    </section>
  );
}
```

Create `src/ui/Tabs.tsx`:

```tsx
import { translate } from '../i18n';
import type { LocaleCode } from '../game/types';
import type { useLifeStore } from '../store/lifeStore';

type Tab = ReturnType<typeof useLifeStore.getState>['activeTab'];

const tabs: Array<{ id: Tab; key: string }> = [
  { id: 'life', key: 'ui.tab.life' },
  { id: 'relationships', key: 'ui.tab.relationships' },
  { id: 'schoolWork', key: 'ui.tab.schoolWork' },
  { id: 'activities', key: 'ui.tab.activities' },
  { id: 'profile', key: 'ui.tab.profile' },
];

export function Tabs({ locale, active, onChange }: { locale: LocaleCode; active: Tab; onChange(tab: Tab): void }) {
  return (
    <nav className="bottom-tabs">
      {tabs.map((tab) => (
        <button className={tab.id === active ? 'active' : ''} key={tab.id} type="button" onClick={() => onChange(tab.id)}>
          {translate(locale, tab.key)}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 6: Wire App**

Replace `src/App.tsx` with:

```tsx
import { useEffect } from 'react';
import { ActivityPanel } from './ui/ActivityPanel';
import { CreateLife } from './ui/CreateLife';
import { Dashboard } from './ui/Dashboard';
import { DeathSummary } from './ui/DeathSummary';
import { RelationshipsPanel } from './ui/RelationshipsPanel';
import { SchoolWorkPanel } from './ui/SchoolWorkPanel';
import { Tabs } from './ui/Tabs';
import { useLifeStore } from './store/lifeStore';

export function App() {
  const { activeTab, ageUpLife, chooseEvent, clearLife, createLife, life, loadLife, locale, runActivity, setActiveTab } = useLifeStore();

  useEffect(() => {
    loadLife();
  }, [loadLife]);

  if (!life) {
    return (
      <main className="app-shell">
        <CreateLife locale={locale} onCreate={createLife} />
      </main>
    );
  }

  if (!life.character.alive) {
    return (
      <main className="app-shell">
        <DeathSummary life={life} onNewLife={clearLife} />
      </main>
    );
  }

  return (
    <main className="app-shell with-tabs">
      {activeTab === 'life' && <Dashboard life={life} onAgeUp={ageUpLife} onChoose={chooseEvent} />}
      {activeTab === 'relationships' && <RelationshipsPanel life={life} />}
      {activeTab === 'schoolWork' && <SchoolWorkPanel life={life} />}
      {activeTab === 'activities' && <ActivityPanel life={life} onRun={runActivity} />}
      {activeTab === 'profile' && <Dashboard life={life} onAgeUp={ageUpLife} onChoose={chooseEvent} />}
      <Tabs locale={locale} active={activeTab} onChange={setActiveTab} />
    </main>
  );
}
```

- [ ] **Step 7: Add mobile panel styles**

Append to `src/styles.css`:

```css
.with-tabs {
  padding-bottom: 88px;
}

.screen-stack {
  display: grid;
  gap: 12px;
}

.grid-panel {
  border: 1px solid #d8e0ec;
  border-radius: 8px;
  background: #ffffff;
  padding: 12px;
}

.hero-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hero-panel h1,
.death-panel h1 {
  margin: 0;
  font-size: 24px;
}

.stats-grid {
  display: grid;
  gap: 10px;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  align-items: center;
}

.meter {
  grid-column: 1 / -1;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6edf6;
}

.meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #2f6fed;
}

.event-card p {
  line-height: 1.55;
}

.button-stack {
  display: grid;
  gap: 8px;
}

button {
  min-height: 44px;
  border: 1px solid #b9c6d8;
  border-radius: 8px;
  background: #ffffff;
  color: #1b2430;
}

button:active {
  transform: translateY(1px);
}

input,
select {
  width: 100%;
  min-height: 44px;
  margin: 6px 0 12px;
  border: 1px solid #b9c6d8;
  border-radius: 8px;
  padding: 0 10px;
  background: #ffffff;
}

.row {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #edf1f6;
  padding: 10px 0;
}

.life-log {
  margin: 0;
  padding-left: 18px;
}

.life-log li {
  margin: 6px 0;
}

.bottom-tabs {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  width: min(100vw, 430px);
  margin: 0 auto;
  border-top: 1px solid #d8e0ec;
  background: #ffffff;
  padding: 6px 8px max(6px, env(safe-area-inset-bottom));
}

.bottom-tabs button {
  min-height: 42px;
  border: 0;
  background: transparent;
  font-size: 12px;
}

.bottom-tabs button.active {
  border-radius: 8px;
  background: #eaf1ff;
  color: #1d56d8;
}
```

- [ ] **Step 8: Run UI test**

Run:

```powershell
npm test -- src/ui/App.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit UI**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/App.tsx src/styles.css src/ui
& 'C:\Program Files\Git\cmd\git.exe' commit -m "feat: build mobile p0 interface"
```

## Task 8: Add PWA Manifest and Final Verification

**Files:**
- Create: `public/manifest.webmanifest`
- Modify: `src/styles.css`
- Modify: `README.md`

- [ ] **Step 1: Add PWA manifest**

Create `public/manifest.webmanifest`:

```json
{
  "name": "Bitliffe",
  "short_name": "Bitliffe",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#f5f7fb",
  "orientation": "portrait",
  "icons": []
}
```

- [ ] **Step 2: Add mobile viewport safety**

Append to `src/styles.css`:

```css
@media (min-width: 431px) {
  body {
    background: #dfe7f2;
  }
}

@media (max-width: 360px) {
  .app-shell {
    padding: 12px;
  }

  .bottom-tabs button {
    font-size: 11px;
  }
}
```

- [ ] **Step 3: Update README run instructions**

Append to `README.md`:

Add this text:

    ## P0 Game Prototype

    Run the mobile-first P0 prototype:

    `npm install`

    `npm run dev`

    Open the local URL shown by Vite. Use a mobile-width viewport around 390 x 844 for primary QA.

- [ ] **Step 4: Run full verification**

Run:

```powershell
npm test
npm run build
```

Expected: all tests pass and production build succeeds.

- [ ] **Step 5: Manual QA checklist**

Start dev server:

```powershell
npm run dev
```

Check:

- Create a life in zh-CN.
- Age up at least 20 years.
- Choose at least three yearly event options.
- Open Relationships, School/Work, and Activities tabs.
- Run Rest, Study, Family Time, and Find Job when eligible.
- Refresh the page and confirm the same life loads.
- Continue aging until death or use test data to lower health, then confirm death summary appears.
- Switch viewport to 390 x 844 and confirm text does not overlap.

- [ ] **Step 6: Commit final PWA polish**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add public README.md src/styles.css
& 'C:\Program Files\Git\cmd\git.exe' commit -m "feat: add pwa polish and docs"
```

## Task 9: Expand P0-M Event Content to 65 Original Events

**Files:**
- Modify: `src/content/events.ts`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/game/engine.test.ts`

- [ ] **Step 1: Tighten content coverage test**

Change the seed content test in `src/game/engine.test.ts` from:

```ts
expect(events.length).toBeGreaterThanOrEqual(24);
```

to:

```ts
expect(events.length).toBeGreaterThanOrEqual(65);
```

Add category assertions:

```ts
const tags = new Set(events.flatMap((event) => event.tags));
expect(Array.from(tags)).toEqual(
  expect.arrayContaining(['birth', 'child', 'school', 'family', 'adult', 'work', 'money', 'health', 'elder']),
);
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/game/engine.test.ts
```

Expected: FAIL because event count is still below 65.

- [ ] **Step 3: Add the remaining original event ids**

Add original event objects until the final list contains at least these ids:

```text
birth_sunny
birth_rainy
birth_busy_home
birth_quiet_night
birth_small_apartment
child_book
child_neighbor
child_lost_toy
child_tree_climb
child_first_drawing
child_puddle_jump
child_shared_snack
child_library_card
child_bedtime_question
child_music_corner
school_test
school_group_project
school_bully_choice
school_art_day
school_sports_day
school_science_board
school_late_homework
school_new_friend
school_teacher_praise
school_bus_delay
family_meal
family_argument
family_sibling_game
family_parent_tired
family_weekend_cleaning
family_small_gift
family_photo_album
family_sick_parent
family_shared_errand
family_holiday_call
adult_walk
adult_room_clean
adult_old_friend
adult_bad_sleep
adult_crowded_train
adult_new_hobby
adult_quiet_cafe
adult_missed_alarm
adult_neighbor_help
adult_long_queue
work_rush
work_kind_customer
work_mistake
work_extra_shift
work_team_lunch
work_confusing_email
work_small_praise
work_commute_delay
work_desk_cleanup
work_new_task
money_wallet
money_small_bonus
money_broken_phone
money_sale_choice
money_unexpected_bill
health_minor_fever
health_knee_pain
health_bad_meal
health_good_sleep
health_checkup_note
elder_quiet_morning
elder_memory_box
elder_slow_walk
elder_family_visit
elder_old_song
```

For every new event:

- Use original text in both languages.
- Use `minAge`, `maxAge`, `weight`, `tags`, and `choices`.
- Keep choices to one or two per event for P0.
- Use effects that only touch attributes, money, relationship, or simple statuses.

- [ ] **Step 4: Run content tests**

Run:

```powershell
npm test -- src/game/engine.test.ts src/i18n/i18n.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit full P0 event pack**

Run:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/content/events.ts src/i18n/locales src/game/engine.test.ts
& 'C:\Program Files\Git\cmd\git.exe' commit -m "feat: expand p0 event content"
```

## Plan Self-Review

Coverage check:

- Product scope: Tasks 1, 7, and 8 create the mobile-first PWA shell.
- Multilingual text: Task 3 creates locale resources and translation helper.
- Original content strategy: Task 4 creates the first event floor; Task 9 expands the P0-M event pack to the confirmed 65-event target.
- Core life loop: Task 5 implements create life, event choice, age up, school stage, salary, health-driven death.
- Single save: Task 6 implements localStorage persistence.
- Mobile data panel UI: Task 7 implements dashboard, panels, bottom tabs, and mobile CSS.
- Verification: Tasks 1 through 9 include unit tests, build checks, and manual QA.

Consistency check:

- `LifeState`, `LifeEvent`, `Effect`, and locale codes are defined before use.
- Store actions map directly to engine functions.
- UI reads through the store and translates through `translate`.
- P0 keeps disease, assets, achievements, crime, cloud saves, and multi-save out of scope.

Execution note:

- If `git` is not on PATH, use `C:\Program Files\Git\cmd\git.exe` as shown.
- If `npm install` updates dependency versions, keep the generated `package-lock.json`.
