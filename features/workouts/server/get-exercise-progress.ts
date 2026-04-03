import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exerciseSets, exercises, workouts } from "@/db/schema";
import type { ExerciseProgressSeries } from "@/features/workouts/types";
import { summarizeCompletedSets } from "@/features/workouts/utils";

export async function getExerciseProgress(): Promise<ExerciseProgressSeries[]> {
  const rows = await db
    .select({
      exerciseId: exercises.id,
      workoutId: workouts.id,
      workoutType: workouts.type,
      dateCompleted: workouts.dateCompleted,
      name: exercises.name,
      description: exercises.description,
      progressMetric: exercises.progressMetric,
      fallbackWeight: exercises.weight,
      setWeight: exerciseSets.weight,
      setReps: exerciseSets.reps,
      setCompleted: exerciseSets.completed,
    })
    .from(exercises)
    .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
    .leftJoin(exerciseSets, eq(exerciseSets.exerciseId, exercises.id))
    .orderBy(
      asc(exercises.name),
      asc(workouts.dateCompleted),
      asc(workouts.id),
      asc(exerciseSets.setIndex),
    );

  const grouped = new Map<string, ExerciseProgressSeries>();
  const exerciseEntries = new Map<
    number,
    {
      name: string;
      description: string;
      progressMetric: "weight" | "reps";
      workoutId: number;
      workoutType: "A" | "B";
      dateCompleted: Date;
      value: number;
      weight: number;
      reps: number;
    }
  >();

  for (const row of rows) {
    if (!exerciseEntries.has(row.exerciseId)) {
      exerciseEntries.set(row.exerciseId, {
        name: row.name,
        description: row.description ?? "",
        progressMetric: row.progressMetric,
        workoutId: row.workoutId,
        workoutType: row.workoutType,
        dateCompleted: row.dateCompleted,
        value: 0,
        weight: row.fallbackWeight,
        reps: 0,
      });
    }
  }

  for (const [exerciseId, entry] of exerciseEntries.entries()) {
    const setRows = rows.filter((row) => row.exerciseId === exerciseId);
    const summary = summarizeCompletedSets(
      setRows.map((row) => ({
        weight: row.setWeight ?? row.fallbackWeight,
        reps: row.setReps ?? 0,
        completed: row.setCompleted ?? false,
      })),
      entry.progressMetric,
    );

    entry.value = summary.value;
    entry.weight = summary.weight;
    entry.reps = summary.reps;
  }

  for (const row of exerciseEntries.values()) {
    const existing = grouped.get(row.name);

    if (!existing) {
      grouped.set(row.name, {
        name: row.name,
        description: row.description,
        progressMetric: row.progressMetric,
        currentValue: row.value,
        currentWeight: row.weight,
        currentReps: row.reps,
        bestValue: row.value,
        bestWeight: row.weight,
        bestReps: row.reps,
        entriesCount: 1,
        points: [
          {
            workoutId: row.workoutId,
            workoutType: row.workoutType,
            dateCompleted: row.dateCompleted,
            value: row.value,
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
      value: row.value,
      weight: row.weight,
      reps: row.reps,
    });
    existing.description = existing.description || row.description || "";
    existing.currentValue = row.value;
    existing.currentWeight = row.weight;
    existing.currentReps = row.reps;

    if (row.value > existing.bestValue) {
      existing.bestValue = row.value;
      existing.bestWeight = row.weight;
      existing.bestReps = row.reps;
    }

    existing.entriesCount += 1;
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
}
