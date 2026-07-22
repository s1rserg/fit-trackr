import "server-only";

import { db } from "@/db";

export async function getWorkoutHistory() {
  return db.query.workouts.findMany({
    orderBy: (workout: any, helpers: { desc: (col: any) => any }) => [helpers.desc(workout.dateCompleted)],
    with: {
      performedExercises: {
        orderBy: (performedExercise: any, helpers: { asc: (col: any) => any }) => [helpers.asc(performedExercise.orderIndex)],
        with: {
          exercise: true,
        },
      },
    },
  });
}
