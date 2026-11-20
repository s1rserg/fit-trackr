import { SESSION_OFFSET } from "@/features/workouts/constants";
import { getLastWorkoutSummary, getWorkoutCount } from "@/features/workouts/server/queries";

import { formatShortDateTime } from "./utils/format-date";
import { WorkoutDashboard } from "./workout-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lastWorkout, workoutCount] = await Promise.all([
    getLastWorkoutSummary(),
    getWorkoutCount(),
  ]);

  return (
    <WorkoutDashboard
      serverWorkout={lastWorkout && {
        type: lastWorkout.type,
        dateCompleted: lastWorkout.dateCompleted.toISOString(),
      }}
      serverWorkoutDateLabel={lastWorkout ? formatShortDateTime(lastWorkout.dateCompleted) : null}
      totalSessionsCount={workoutCount + SESSION_OFFSET}
    />
  );
}
