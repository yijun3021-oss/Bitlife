export interface RandomSource {
  next(): number;
}

export function createSeededRandom(seed: string): RandomSource {
  let state = hashSeed(seed);
  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    },
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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
