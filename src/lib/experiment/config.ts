import type { Position, ResponseKey, TrialStimulus } from "./types";

// DEVELOPMENT/TEST VALUES ONLY. Replace these with the approved protocol later.
export const DEVELOPMENT_TIMING = {
  fixationDurationMs: 800,
  imagePresentationDurationMs: 1200,
  blankIntervalDurationMs: 500,
  numberOfTrials: 20,
} as const;

export const RESPONSE_KEYS: Record<Position, ResponseKey> = {
  LEFT: "Q",
  RIGHT: "O",
};

// DEVELOPMENT/TEST STIMULI ONLY. These paths are placeholders for future stimuli.
export const DEVELOPMENT_STIMULI: TrialStimulus[] = [
  {
    babyImage: "/test-stimuli/test-baby.svg",
    adultImage: "/test-stimuli/test-adult.svg",
    adultGender: "TEST adult",
    babyPosition: "LEFT",
    adultPosition: "RIGHT",
  },
  {
    babyImage: "/test-stimuli/test-baby.svg",
    adultImage: "/test-stimuli/test-adult.svg",
    adultGender: "TEST adult",
    babyPosition: "RIGHT",
    adultPosition: "LEFT",
  },
];

export function createDevelopmentTrials(): TrialStimulus[] {
  return Array.from({ length: DEVELOPMENT_TIMING.numberOfTrials }, (_, index) =>
    DEVELOPMENT_STIMULI[index % DEVELOPMENT_STIMULI.length],
  );
}

export function createStimulusTrials(adults: string[], babies: string[]): TrialStimulus[] {
  if (adults.length === 0 || babies.length === 0) {
    throw new Error("Both adult and baby stimulus datasets must contain at least one image.");
  }

  const pairCount = adults.length * babies.length;
  const usedPairs = new Set<number>();

  return Array.from({ length: DEVELOPMENT_TIMING.numberOfTrials }, () => {
    let pairIndex: number;

    if (usedPairs.size >= pairCount) {
      pairIndex = Math.floor(Math.random() * pairCount);
    } else {
      const startingPair = Math.floor(Math.random() * pairCount);
      pairIndex = startingPair;
      while (usedPairs.has(pairIndex)) {
        pairIndex = (pairIndex + 1) % pairCount;
      }
      usedPairs.add(pairIndex);
    }

    const adultImage = adults[Math.floor(pairIndex / babies.length)];
    const babyImage = babies[pairIndex % babies.length];
    const babyPosition = Math.random() < 0.5 ? "LEFT" : "RIGHT";

    return {
      adultImage,
      babyImage,
      adultGender: "Adult",
      babyPosition,
      adultPosition: babyPosition === "LEFT" ? "RIGHT" : "LEFT",
    };
  });
}

export function chooseDevelopmentDotPosition(): Position {
  return Math.random() < 0.5 ? "LEFT" : "RIGHT";
}