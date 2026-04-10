import "server-only";

import { db } from "@/db";

export async function getWorkoutHistory() {
  return db.query.workouts.findMany({
    orderBy: (workout, { desc }) => [desc(workout.dateCompleted)],
    with: {
      performedExercises: {
        orderBy: (performedExercise, { asc }) => [asc(performedExercise.orderIndex)],
        with: {
          exercise: true,
        },
      },
    },
  });
}
