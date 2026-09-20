import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { exercises, workoutTemplateItems } from "@/db/schema";
import type { WorkoutType } from "@/features/workouts/constants";
import type { ActiveWorkoutData } from "@/features/workouts/types";
import { getDefaultRepsValue } from "@/features/workouts/utils";

import { getLastPerformanceByExerciseIds } from "./get-last-performance-by-exercise-names";

export async function getActiveWorkoutData(type: WorkoutType): Promise<ActiveWorkoutData> {
  const templateItems = await db
    .select({
      exerciseId: exercises.id,
      name: exercises.name,
      description: exercises.description,
      progressMetric: exercises.progressMetric,
      targetSets: workoutTemplateItems.targetSets,
      targetReps: workoutTemplateItems.targetReps,
      orderIndex: workoutTemplateItems.orderIndex,
    })
    .from(workoutTemplateItems)
    .innerJoin(exercises, eq(workoutTemplateItems.exerciseId, exercises.id))
    .where(eq(workoutTemplateItems.workoutType, type))
    .orderBy(workoutTemplateItems.orderIndex);

  const previousPerformance = await getLastPerformanceByExerciseIds(
    templateItems.map((item) => item.exerciseId).filter((id) => id > 0),
  );

  return {
    type,
    exercises: templateItems.map((item) => {
      const prev = previousPerformance.get(item.exerciseId);
      const initialWeight = prev?.weight ?? 0;
      const initialReps = prev?.reps ?? getDefaultRepsValue(item.targetReps);

      return {
        exerciseId: item.exerciseId,
        name: item.name,
        description: item.description ?? "",
        note: prev?.note ?? "",
        progressMetric: item.progressMetric,
        targetSets: item.targetSets,
        targetReps: item.targetReps,
        orderIndex: item.orderIndex,
        previousWorkoutDate: prev?.workoutDate ?? null,
        setLogs: Array.from({ length: item.targetSets }, (_, setIdx: number) => ({
          setIndex: setIdx + 1,
          weight: initialWeight,
          reps: initialReps,
          completed: false,
        })),
      };
    }),
  };
}
