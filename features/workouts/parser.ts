import { SHORTHAND_WARMUP_TOKENS } from "./constants";

export type ParsedSet = {
  setIndex: number;
  weight: number;
  reps: number;
  completed: boolean;
};

export type ParsedChip =
  | { readonly type: "warmup"; readonly label: string }
  | {
      readonly type: "set";
      readonly setIndex: number;
      readonly weight: number;
      readonly reps: number;
      readonly label: string;
    }
  | { readonly type: "note"; readonly label: string };

export type ParsedShorthandResult = {
  hasWarmup: boolean;
  sets: ParsedSet[];
  chips: ParsedChip[];
  additionalNote: string;
  isValid: boolean;
};

const MULTIPLY_REGEX = /[xX*хХ]/;

function isWarmupToken(token: string): boolean {
  const normalized = token.trim().toLowerCase();
  return (SHORTHAND_WARMUP_TOKENS as readonly string[]).includes(normalized);
}

export function parseShorthandInput(
  rawInput: string,
  fallbackWeight: number = 0,
  defaultTargetSets: number = 3,
): ParsedShorthandResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      hasWarmup: false,
      sets: [],
      chips: [],
      additionalNote: "",
      isValid: false,
    };
  }

  // Split on optional pipe | or trailing comment
  const pipeIndex = trimmed.indexOf("|");
  let mainText = trimmed;
  let additionalNote = "";

  if (pipeIndex !== -1) {
    mainText = trimmed.slice(0, pipeIndex).trim();
    additionalNote = trimmed.slice(pipeIndex + 1).trim();
  }

  const rawTokens = mainText.split(/\s+/).filter(Boolean);
  const chips: ParsedChip[] = [];
  const sets: ParsedSet[] = [];

  let hasWarmup = false;
  const filteredTokens: string[] = [];

  for (const token of rawTokens) {
    if (isWarmupToken(token)) {
      hasWarmup = true;
    } else {
      filteredTokens.push(token);
    }
  }

  if (hasWarmup) {
    chips.push({ type: "warmup", label: "R" });
  }

  let textNotes: string[] = [];

  // Check Pattern A: Weight x Sets x Reps, e.g. "35x3x12" (weight: 35, sets: 3, reps: 12)
  if (filteredTokens.length >= 1 && filteredTokens[0].split(MULTIPLY_REGEX).length === 3) {
    const parts = filteredTokens[0].split(MULTIPLY_REGEX);
    const weight = Number.parseFloat(parts[0]);
    const numSets = Number.parseInt(parts[1], 10);
    const reps = Number.parseInt(parts[2], 10);

    if (!Number.isNaN(weight) && !Number.isNaN(numSets) && !Number.isNaN(reps)) {
      for (let i = 1; i <= numSets; i += 1) {
        sets.push({ setIndex: i, weight, reps, completed: true });
        chips.push({
          type: "set",
          setIndex: i,
          weight,
          reps,
          label: `${weight}kg × ${reps}`,
        });
      }
      textNotes = filteredTokens.slice(1);
    }
  }
  // Check Pattern B: Weight x Sets, e.g. "65x3" or "20x3"
  else if (
    filteredTokens.length >= 1 &&
    filteredTokens[0].split(MULTIPLY_REGEX).length === 2 &&
    // Check if second part is a low set count (<= 6)
    Number.parseInt(filteredTokens[0].split(MULTIPLY_REGEX)[1], 10) <= 6
  ) {
    const parts = filteredTokens[0].split(MULTIPLY_REGEX);
    const weight = Number.parseFloat(parts[0]);
    const numSets = Number.parseInt(parts[1], 10);
    const defaultReps = 10; // default working reps

    if (!Number.isNaN(weight) && !Number.isNaN(numSets)) {
      for (let i = 1; i <= numSets; i += 1) {
        sets.push({ setIndex: i, weight, reps: defaultReps, completed: true });
        chips.push({
          type: "set",
          setIndex: i,
          weight,
          reps: defaultReps,
          label: `${weight}kg × ${numSets} sets`,
        });
      }
      textNotes = filteredTokens.slice(1);
    }
  }
  // Check Pattern C: Reps sequence ending with weight, e.g. "12 12 9 60" or "12 12 9 55"
  // Where all but last are reps (typically <= 30), and last is a weight (> 30 or significantly higher)
  else if (
    filteredTokens.length >= 2 &&
    filteredTokens.every((t) => !Number.isNaN(Number(t))) &&
    Number(filteredTokens[filteredTokens.length - 1]) > 20 &&
    filteredTokens.slice(0, -1).every((t) => Number(t) <= 30)
  ) {
    const weight = Number.parseFloat(filteredTokens[filteredTokens.length - 1]);
    const repTokens = filteredTokens.slice(0, -1);

    repTokens.forEach((token, index) => {
      const reps = Number.parseInt(token, 10);
      const setIndex = index + 1;
      sets.push({ setIndex, weight, reps, completed: true });
      chips.push({
        type: "set",
        setIndex,
        weight,
        reps,
        label: `${weight}kg × ${reps}`,
      });
    });
  }
  // Check Pattern D: Standard token by token parsing (e.g. 50x12, 12, 45x12)
  else {
    let currentWeight = fallbackWeight > 0 ? fallbackWeight : 0;
    let setCounter = 1;

    for (const token of filteredTokens) {
      if (MULTIPLY_REGEX.test(token)) {
        const parts = token.split(MULTIPLY_REGEX);
        if (parts.length === 2) {
          const parsedWeight = Number.parseFloat(parts[0]);
          const parsedReps = Number.parseInt(parts[1], 10);

          if (!Number.isNaN(parsedWeight) && !Number.isNaN(parsedReps) && parsedReps > 0) {
            currentWeight = parsedWeight;
            sets.push({
              setIndex: setCounter,
              weight: currentWeight,
              reps: parsedReps,
              completed: true,
            });
            chips.push({
              type: "set",
              setIndex: setCounter,
              weight: currentWeight,
              reps: parsedReps,
              label: `${currentWeight}kg × ${parsedReps}`,
            });
            setCounter += 1;
            continue;
          }
        }
      }

      // Plain number: treat as reps
      const parsedReps = Number.parseInt(token, 10);
      if (!Number.isNaN(parsedReps) && parsedReps > 0 && String(parsedReps) === token) {
        sets.push({
          setIndex: setCounter,
          weight: currentWeight,
          reps: parsedReps,
          completed: true,
        });
        chips.push({
          type: "set",
          setIndex: setCounter,
          weight: currentWeight,
          reps: parsedReps,
          label: `${currentWeight > 0 ? `${currentWeight}kg × ` : ""}${parsedReps}`,
        });
        setCounter += 1;
        continue;
      }

      // Word / comment token
      textNotes.push(token);
    }
  }

  const combinedNote = [additionalNote, ...textNotes].filter(Boolean).join(" ");

  if (combinedNote) {
    chips.push({ type: "note", label: combinedNote });
  }

  return {
    hasWarmup,
    sets,
    chips,
    additionalNote: combinedNote,
    isValid: sets.length > 0 || hasWarmup,
  };
}
