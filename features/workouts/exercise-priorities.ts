import type { ActiveWorkoutExercise } from "./types";

export type MuscleGroup =
  | "chest"
  | "back"
  | "quads"
  | "hamstrings"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "calves"
  | "abs";

export type MovementTier = "compound" | "major_isolation" | "minor_isolation" | "core";

export type ExerciseProfile = {
  name: string;
  muscleGroup: MuscleGroup;
  tier: MovementTier;
  synergistMuscles: MuscleGroup[];
};

export const EXERCISE_PROFILES: Record<string, ExerciseProfile> = {
  "Incline Chest Press": {
    name: "Incline Chest Press",
    muscleGroup: "chest",
    tier: "compound",
    synergistMuscles: ["triceps", "shoulders"],
  },
  "Lat Pulldown": {
    name: "Lat Pulldown",
    muscleGroup: "back",
    tier: "compound",
    synergistMuscles: ["biceps"],
  },
  "Seated Row": {
    name: "Seated Row",
    muscleGroup: "back",
    tier: "compound",
    synergistMuscles: ["biceps"],
  },
  "Pull-Ups": {
    name: "Pull-Ups",
    muscleGroup: "back",
    tier: "compound",
    synergistMuscles: ["biceps"],
  },
  "Leg Press": {
    name: "Leg Press",
    muscleGroup: "quads",
    tier: "compound",
    synergistMuscles: [],
  },
  "Leg Extensions": {
    name: "Leg Extensions",
    muscleGroup: "quads",
    tier: "major_isolation",
    synergistMuscles: [],
  },
  "Lying Leg Curl": {
    name: "Lying Leg Curl",
    muscleGroup: "hamstrings",
    tier: "major_isolation",
    synergistMuscles: [],
  },
  "Machine Shoulder Press": {
    name: "Machine Shoulder Press",
    muscleGroup: "shoulders",
    tier: "compound",
    synergistMuscles: ["triceps"],
  },
  "Machine Lateral Raise": {
    name: "Machine Lateral Raise",
    muscleGroup: "shoulders",
    tier: "minor_isolation",
    synergistMuscles: [],
  },
  "Reverse Pec Deck": {
    name: "Reverse Pec Deck",
    muscleGroup: "shoulders",
    tier: "minor_isolation",
    synergistMuscles: [],
  },
  "Pec Deck": {
    name: "Pec Deck",
    muscleGroup: "chest",
    tier: "major_isolation",
    synergistMuscles: [],
  },
  "Preacher Curl": {
    name: "Preacher Curl",
    muscleGroup: "biceps",
    tier: "minor_isolation",
    synergistMuscles: [],
  },
  "Hammer Curl": {
    name: "Hammer Curl",
    muscleGroup: "biceps",
    tier: "minor_isolation",
    synergistMuscles: [],
  },
  "Bicep Cable Curl": {
    name: "Bicep Cable Curl",
    muscleGroup: "biceps",
    tier: "minor_isolation",
    synergistMuscles: [],
  },
  "Overhead Triceps Extension": {
    name: "Overhead Triceps Extension",
    muscleGroup: "triceps",
    tier: "minor_isolation",
    synergistMuscles: [],
  },
  "Triceps Pressdown": {
    name: "Triceps Pressdown",
    muscleGroup: "triceps",
    tier: "minor_isolation",
    synergistMuscles: [],
  },
  "Leg Press Calf Raise": {
    name: "Leg Press Calf Raise",
    muscleGroup: "calves",
    tier: "minor_isolation",
    synergistMuscles: [],
  },
  "Captain's Chair Knee Raises": {
    name: "Captain's Chair Knee Raises",
    muscleGroup: "abs",
    tier: "core",
    synergistMuscles: [],
  },
  "Ab Crunch Machine": {
    name: "Ab Crunch Machine",
    muscleGroup: "abs",
    tier: "core",
    synergistMuscles: [],
  },
};

export type BusyRecommendation = {
  shouldWait: boolean;
  exercise: ActiveWorkoutExercise | null;
  exerciseIndex: number;
  headline: string;
  rationale: string;
};

export function evaluateNextBestExercise(
  busyExerciseIds: Set<number>,
  allExercises: ActiveWorkoutExercise[],
  completedExerciseIds: Set<number>,
): BusyRecommendation {
  // Find candidates that are NOT completed and NOT busy
  const availableCandidates = allExercises
    .map((ex, idx) => ({ exercise: ex, index: idx }))
    .filter(
      ({ exercise }) =>
        !completedExerciseIds.has(exercise.exerciseId) &&
        !busyExerciseIds.has(exercise.exerciseId),
    );

  if (availableCandidates.length === 0) {
    return {
      shouldWait: true,
      exercise: null,
      exerciseIndex: -1,
      headline: "All remaining stations are occupied",
      rationale: "Take a 2–3 minute rest interval and claim the first machine that frees up.",
    };
  }

  // Get profiles of busy exercises to check conflicts
  const busyProfiles = Array.from(busyExerciseIds)
    .map((id) => allExercises.find((e) => e.exerciseId === id))
    .filter(Boolean)
    .map((e) => EXERCISE_PROFILES[e!.name] ?? null)
    .filter(Boolean);

  const hasBusyCompound = busyProfiles.some((p) => p.tier === "compound");
  const busySynergists = new Set(busyProfiles.flatMap((p) => p.synergistMuscles));

  // Score candidates: higher is better
  const scored = availableCandidates.map((candidate) => {
    const profile = EXERCISE_PROFILES[candidate.exercise.name];
    let score = 50;
    let reason = "Independent movement pattern with clean recovery.";

    if (!profile) {
      return { ...candidate, score: 30, reason };
    }

    // Never do core/abs if heavy compound lifts are still pending
    if (profile.tier === "core") {
      if (hasBusyCompound) {
        score = -100; // Strong penalty
        reason = "Fatigues spinal stabilizers needed for your heavy compound lifts.";
      } else {
        score = 10;
        reason = "Core finisher.";
      }
    }
    // Avoid fatiguing synergists of a pending compound lift
    else if (busySynergists.has(profile.muscleGroup)) {
      score = -50;
      reason = `Fatigues ${profile.muscleGroup}, which you need fresh for pending compound lifts.`;
    }
    // Independent compound lifts are highest priority
    else if (profile.tier === "compound") {
      score = 90;
      reason = "Heavy compound lift targeting fresh, un-fatigued muscle groups.";
    }
    // Major isolation (legs/pecs)
    else if (profile.tier === "major_isolation") {
      score = 75;
      reason = "Independent major muscle group with zero overlap.";
    }
    // Minor isolation (side delts, rear delts)
    else if (profile.tier === "minor_isolation") {
      score = 60;
      reason = "Isolated movement that keeps rest of the body fresh.";
    }

    return { ...candidate, score, reason, profile };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];

  // If even the best option has a negative score, advise waiting!
  if (best.score <= 0) {
    return {
      shouldWait: true,
      exercise: null,
      exerciseIndex: -1,
      headline: "Better to rest and wait",
      rationale:
        "The remaining exercises (arms or core) would fatigue your grip and stabilizers for your main compound lift. Rest 2–3 minutes and wait for the machine.",
    };
  }

  return {
    shouldWait: false,
    exercise: best.exercise,
    exerciseIndex: best.index,
    headline: `Do ${best.exercise.name} next`,
    rationale: best.reason,
  };
}
