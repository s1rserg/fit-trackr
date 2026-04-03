import "server-only";

import { db } from "@/db";

export async function getWorkoutHistory() {
  return db.query.workouts.findMany({
    orderBy: (workout, { desc }) => [desc(workout.dateCompleted)],
    with: {
      exercises: {
        orderBy: (exercise, { asc }) => [asc(exercise.orderIndex)],
        with: {
          setLogs: {
            orderBy: (setLog, { asc }) => [asc(setLog.setIndex)],
          },
        },
      },
    },
  });
}
