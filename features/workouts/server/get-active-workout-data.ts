import "server-only";

import { asc, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { exercises } from "@/db/schema";
import { type WorkoutType } from "@/features/workouts/config";
import type { ActiveWorkoutData } from "@/features/workouts/types";
import { getDefaultRepsValue } from "@/features/workouts/utils";

import { getLastPerformanceByExerciseIds } from "./get-last-performance-by-exercise-names";

const DEFAULT_SET_COUNT = 3;

export async function getActiveWorkoutData(type: WorkoutType): Promise<ActiveWorkoutData> {
  const template = await db
    .select({
      exerciseId: exercises.id,
      name: exercises.name,
      description: exercises.description,
      progressMetric: exercises.progressMetric,
      targetReps: exercises.targetReps,
      orderIndex: exercises.orderIndex,
    })
    .from(exercises)
    .where(or(eq(exercises.workoutScope, type), eq(exercises.workoutScope, "both")))
    .orderBy(asc(exercises.orderIndex), asc(exercises.id));

  const previousPerformance = await getLastPerformanceByExerciseIds(
    template.map((item) => item.exerciseId),
  );

  return {
    type,
    exercises: template.map((item, index) => ({
      exerciseId: item.exerciseId,
      name: item.name,
      description: item.description ?? "",
      note: previousPerformance.get(item.exerciseId)?.note ?? "",
      progressMetric: item.progressMetric,
      targetSets: DEFAULT_SET_COUNT,
      targetReps: item.targetReps,
      // Normalize to a guaranteed positive sequence even if DB was edited manually.
      orderIndex: index + 1,
      previousWorkoutDate: previousPerformance.get(item.exerciseId)?.workoutDate ?? null,
      setLogs: Array.from({ length: DEFAULT_SET_COUNT }, (_, index) => ({
        setIndex: index + 1,
        weight: previousPerformance.get(item.exerciseId)?.weight ?? 0,
        reps:
          previousPerformance.get(item.exerciseId)?.reps ??
          getDefaultRepsValue(item.targetReps),
        completed: false,
      })),
    })),
  };
}
