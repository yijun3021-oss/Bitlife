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
