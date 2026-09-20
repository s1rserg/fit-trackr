export const WORKOUT_TYPES = {
  A: "A",
  B: "B",
  C: "C",
} as const;

export type WorkoutType = typeof WORKOUT_TYPES[keyof typeof WORKOUT_TYPES];

export const PROGRESS_METRICS = {
  WEIGHT: "weight",
  REPS: "reps",
} as const;

export type ProgressMetric = typeof PROGRESS_METRICS[keyof typeof PROGRESS_METRICS];

export const SESSION_OFFSET = 7;

export const WORKOUT_METADATA: Record<
  WorkoutType,
  { readonly title: string; readonly subtitle: string; readonly routineLabel: string }
> = {
  [WORKOUT_TYPES.A]: {
    title: "Full Body A",
    subtitle: "Push + Vertical Pull",
    routineLabel: "Workout A",
  },
  [WORKOUT_TYPES.B]: {
    title: "Full Body B",
    subtitle: "Back + Chest",
    routineLabel: "Workout B",
  },
  [WORKOUT_TYPES.C]: {
    title: "Full Body C",
    subtitle: "Shoulders + Arms",
    routineLabel: "Workout C",
  },
};

export const ROUTES = {
  HOME: "/",
  HISTORY: "/history",
  PROGRESS: "/progress",
  WORKOUT: (type: WorkoutType) => `/workouts/${type}`,
} as const;

export const SHORTHAND_WARMUP_TOKENS = ["r", "р", "warmup", "разминка"] as const;
