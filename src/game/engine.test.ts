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
