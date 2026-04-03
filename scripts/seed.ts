import "dotenv/config";

import { db } from "../db";
import { exerciseSets, exercises, workouts } from "../db/schema";
import { workoutTemplates } from "../features/workouts/config";
import { getDefaultRepsValue } from "../features/workouts/utils";

async function main() {
  for (const type of ["A", "B"] as const) {
    const [workout] = await db
      .insert(workouts)
      .values({
        type,
        dateCompleted: new Date(),
      })
      .returning();

    const insertedExercises = await db
      .insert(exercises)
      .values(
        workoutTemplates[type].map((exercise) => ({
          workoutId: workout.id,
          name: exercise.name,
          description: exercise.description,
          progressMetric: exercise.progressMetric,
          weight: 0,
          sets: exercise.sets,
          reps: exercise.reps,
          orderIndex: exercise.orderIndex,
        })),
      )
      .returning();

    await db.insert(exerciseSets).values(
      insertedExercises.flatMap((exercise) =>
        Array.from({ length: exercise.sets }, (_, index) => ({
          exerciseId: exercise.id,
          setIndex: index + 1,
          weight: 0,
          reps: getDefaultRepsValue(exercise.reps),
          completed: false,
        })),
      ),
    );
  }

  console.log("Seeded A/B workout templates as initial sessions.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
