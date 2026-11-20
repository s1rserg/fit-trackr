import { workoutTypeSchema } from "./schemas";
import type { WorkoutType } from "./constants";

const KEY = "fittrackr:latest-completed-workout";

export type CompletedWorkoutSummary = {
  type: WorkoutType;
  dateCompleted: string;
};

export function readCompletedWorkout(): CompletedWorkoutSummary | null {
  try {
    const cached = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    const type = workoutTypeSchema.safeParse(cached?.type);
    if (
      type.success &&
      typeof cached.dateCompleted === "string" &&
      Number.isFinite(Date.parse(cached.dateCompleted))
    ) {
      return { type: type.data, dateCompleted: cached.dateCompleted };
    }
  } catch {
    // The dashboard can still use its server-rendered snapshot.
  }
  return null;
}

export function rememberCompletedWorkout(workout: CompletedWorkoutSummary) {
  const cached = readCompletedWorkout();
  if (cached && Date.parse(cached.dateCompleted) >= Date.parse(workout.dateCompleted)) return;

  try {
    window.localStorage.setItem(KEY, JSON.stringify(workout));
  } catch {
    // Local storage is optional for displaying the server-rendered snapshot.
  }
}
