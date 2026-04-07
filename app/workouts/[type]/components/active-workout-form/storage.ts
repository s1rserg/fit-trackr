import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";

const ACTIVE_WORKOUT_DRAFT_KEY_PREFIX = "fittrackr:active-workout";

export function getActiveWorkoutDraftKey(workoutType: string) {
  return `${ACTIVE_WORKOUT_DRAFT_KEY_PREFIX}:${workoutType}`;
}

export function readActiveWorkoutDraft(workoutType: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(getActiveWorkoutDraftKey(workoutType));
}

export function writeActiveWorkoutDraft(
  workoutType: string,
  values: ActiveWorkoutSubmission,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getActiveWorkoutDraftKey(workoutType),
    JSON.stringify(values),
  );
}

export function clearActiveWorkoutDraft(workoutType: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getActiveWorkoutDraftKey(workoutType));
}
