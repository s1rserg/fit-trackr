import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { exercises } from "@/db/schema";
import { workoutTemplates, type WorkoutType } from "@/features/workouts/config";
import type { ActiveWorkoutData } from "@/features/workouts/types";
import { getDefaultRepsValue } from "@/features/workouts/utils";

import { getLastPerformanceByExerciseIds } from "./get-last-performance-by-exercise-names";

export async function getActiveWorkoutData(type: WorkoutType): Promise<ActiveWorkoutData> {
  const templateConfig = workoutTemplates[type];
  const templateNames = templateConfig.map((item) => item.name);

  const dbExercises = await db
    .select({
      exerciseId: exercises.id,
      name: exercises.name,
      description: exercises.description,
      progressMetric: exercises.progressMetric,
      targetReps: exercises.targetReps,
    })
    .from(exercises)
    .where(inArray(exercises.name, templateNames));

  type DbExercise = typeof dbExercises[number];
  const dbExerciseByName = new Map<string, DbExercise>(
    dbExercises.map((ex: DbExercise) => [ex.name, ex]),
  );

  const orderedExercises = templateConfig.map((configItem) => {
    const dbItem = dbExerciseByName.get(configItem.name);
    return {
      exerciseId: dbItem?.exerciseId ?? 0,
      name: configItem.name,
      description: configItem.description || dbItem?.description || "",
      progressMetric: configItem.progressMetric || dbItem?.progressMetric || "weight",
      targetSets: configItem.sets,
      targetReps: configItem.reps,
      orderIndex: configItem.orderIndex,
    };
  });

  const previousPerformance = await getLastPerformanceByExerciseIds(
    orderedExercises.map((item) => item.exerciseId).filter((id) => id > 0),
  );

  return {
    type,
    exercises: orderedExercises.map((item) => ({
      exerciseId: item.exerciseId,
      name: item.name,
      description: item.description,
      note: previousPerformance.get(item.exerciseId)?.note ?? "",
      progressMetric: item.progressMetric,
      targetSets: item.targetSets,
      targetReps: item.targetReps,
      orderIndex: item.orderIndex,
      previousWorkoutDate: previousPerformance.get(item.exerciseId)?.workoutDate ?? null,
      setLogs: Array.from({ length: item.targetSets }, (_, setIdx: number) => ({
        setIndex: setIdx + 1,
        weight: previousPerformance.get(item.exerciseId)?.weight ?? 0,
        reps:
          previousPerformance.get(item.exerciseId)?.reps ??
          getDefaultRepsValue(item.targetReps),
        completed: false,
      })),
    })),
  };
}
