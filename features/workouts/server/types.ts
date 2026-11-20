import type { CompletedWorkoutSummary } from "../completed-workout-storage";

export type SaveWorkoutSessionResult =
  | {
      success: true;
      workout: CompletedWorkoutSummary;
    }
  | {
      success: false;
      error: string;
    };
