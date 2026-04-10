import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exercises, performedExercises, workouts } from "@/db/schema";
import type { ExerciseProgressSeries } from "@/features/workouts/types";

export async function getExerciseProgress(): Promise<ExerciseProgressSeries[]> {
  const rows = await db
    .select({
      exerciseId: performedExercises.exerciseId,
      workoutId: workouts.id,
      workoutType: workouts.type,
      dateCompleted: workouts.dateCompleted,
      name: exercises.name,
      description: exercises.description,
      progressMetric: exercises.progressMetric,
      weight: performedExercises.weight,
      reps: performedExercises.reps,
    })
    .from(performedExercises)
    .innerJoin(exercises, eq(performedExercises.exerciseId, exercises.id))
    .innerJoin(workouts, eq(performedExercises.workoutId, workouts.id))
    .orderBy(
      asc(exercises.name),
      asc(workouts.dateCompleted),
      asc(workouts.id),
      asc(performedExercises.orderIndex),
    );

  const grouped = new Map<string, ExerciseProgressSeries>();
  for (const row of rows) {
    const value = row.progressMetric === "reps" ? row.reps : row.weight;
    const existing = grouped.get(row.name);

    if (!existing) {
      grouped.set(row.name, {
        name: row.name,
        description: row.description ?? "",
        progressMetric: row.progressMetric,
        currentValue: value,
        currentWeight: row.weight,
        currentReps: row.reps,
        bestValue: value,
        bestWeight: row.weight,
        bestReps: row.reps,
        entriesCount: 1,
        points: [
          {
            workoutId: row.workoutId,
            workoutType: row.workoutType,
            dateCompleted: row.dateCompleted,
            value,
            weight: row.weight,
            reps: row.reps,
          },
        ],
      });
      continue;
    }

    existing.points.push({
      workoutId: row.workoutId,
      workoutType: row.workoutType,
      dateCompleted: row.dateCompleted,
      value,
      weight: row.weight,
      reps: row.reps,
    });
    existing.description = existing.description || row.description || "";
    existing.currentValue = value;
    existing.currentWeight = row.weight;
    existing.currentReps = row.reps;

    if (value > existing.bestValue) {
      existing.bestValue = value;
      existing.bestWeight = row.weight;
      existing.bestReps = row.reps;
    }

    existing.entriesCount += 1;
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
}
