export type WorkoutType = "A" | "B" | "C";
export type ProgressMetric = "weight" | "reps";

export const workoutMeta: Record<WorkoutType, { title: string; subtitle: string; icon: string }> = {
  A: {
    title: "Full Body A",
    subtitle: "Push + Vertical Pull",
    icon: "🅰️",
  },
  B: {
    title: "Full Body B",
    subtitle: "Back + Chest",
    icon: "🅱️",
  },
  C: {
    title: "Full Body C",
    subtitle: "Shoulders",
    icon: "🅲",
  },
};
