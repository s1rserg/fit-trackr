import "dotenv/config";

import { db } from "../db";
import { exercises, performedExercises, workouts } from "../db/schema";
import { workoutTemplates, type WorkoutType } from "../features/workouts/config";

async function main() {
  const definitionByName = new Map<
    string,
    {
      name: string;
      description: string;
      progressMetric: "weight" | "reps";
      targetReps: string;
      orderIndex: number;
      hasA: boolean;
      hasB: boolean;
    }
  >();

  for (const type of ["A", "B"] as const) {
    for (const exercise of workoutTemplates[type]) {
      const existing = definitionByName.get(exercise.name);

      if (!existing) {
        definitionByName.set(exercise.name, {
          name: exercise.name,
          description: exercise.description,
          progressMetric: exercise.progressMetric,
          targetReps: exercise.reps,
          orderIndex: exercise.orderIndex,
          hasA: type === "A",
          hasB: type === "B",
        });
        continue;
      }

      definitionByName.set(exercise.name, {
        ...existing,
        description: existing.description || exercise.description,
        targetReps: existing.targetReps || exercise.reps,
        orderIndex: Math.min(existing.orderIndex, exercise.orderIndex),
        hasA: existing.hasA || type === "A",
        hasB: existing.hasB || type === "B",
      });
    }
  }

  await db
    .insert(exercises)
    .values(
      Array.from(definitionByName.values()).map((exercise) => ({
        name: exercise.name,
        description: exercise.description || null,
        progressMetric: exercise.progressMetric,
        targetReps: exercise.targetReps,
        orderIndex: exercise.orderIndex,
        workoutScope:
          exercise.hasA && exercise.hasB
            ? ("both" as const)
            : exercise.hasA
              ? ("A" as const)
              : ("B" as const),
      })),
    )
    .onConflictDoNothing();

  const definitions = await db.query.exercises.findMany();
  const definitionIds = new Map(definitions.map((exercise) => [exercise.name, exercise.id]));

  for (const type of ["A", "B"] as const) {
    const [workout] = await db
      .insert(workouts)
      .values({
        type: type as WorkoutType,
        dateCompleted: new Date(),
      })
      .returning();

    await db
      .insert(performedExercises)
      .values(
        workoutTemplates[type].map((exercise) => {
          const definitionId = definitionIds.get(exercise.name);

          if (!definitionId) {
            throw new Error(`Exercise definition not found for "${exercise.name}"`);
          }

          return {
            workoutId: workout.id,
            exerciseId: definitionId,
            note: null,
            weight: 0,
            reps: 0,
            orderIndex: exercise.orderIndex,
          };
        }),
      );
  }

  console.log("Seeded exercise catalog and sample A/B workouts.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
