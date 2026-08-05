import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exercises, performedExercises, workoutTemplateItems, workouts } from "@/db/schema";
import type { WorkoutType } from "@/features/workouts/config";
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

  // For Workout C, programmatically alternate between Preacher Curl and Overhead Triceps Extension
  if (type === "C") {
    const lastWorkoutCRows = await db
      .select({
        exerciseName: exercises.name,
      })
      .from(performedExercises)
      .innerJoin(workouts, eq(performedExercises.workoutId, workouts.id))
      .innerJoin(exercises, eq(performedExercises.exerciseId, exercises.id))
      .where(eq(workouts.type, "C"))
      .orderBy(desc(workouts.dateCompleted), desc(workouts.id))
      .limit(15);

    const lastArmEx = lastWorkoutCRows.find(
      (r) => r.exerciseName === "Preacher Curl" || r.exerciseName === "Overhead Triceps Extension",
    )?.exerciseName;

    // If last performed arm exercise in Workout C was Preacher Curl, switch to Overhead Triceps Extension (or vice versa)
    const nextArmExName = lastArmEx === "Preacher Curl" ? "Overhead Triceps Extension" : "Preacher Curl";

    const nextArmExDb = await db
      .select({
        id: exercises.id,
        name: exercises.name,
        description: exercises.description,
        progressMetric: exercises.progressMetric,
      })
      .from(exercises)
      .where(eq(exercises.name, nextArmExName))
      .limit(1);

    if (nextArmExDb.length > 0) {
      const armEx = nextArmExDb[0];
      const slotIndex = templateItems.findIndex((item) => item.orderIndex === 7);
      if (slotIndex !== -1) {
        templateItems[slotIndex] = {
          exerciseId: armEx.id,
          name: armEx.name,
          description: armEx.description || "Alternate weekly between Preacher Curl and Overhead Triceps Extension.",
          progressMetric: armEx.progressMetric,
          targetSets: 3,
          targetReps: "10–15",
          orderIndex: 7,
        };
      }
    }
  }

  const previousPerformance = await getLastPerformanceByExerciseIds(
    templateItems.map((item) => item.exerciseId).filter((id) => id > 0),
  );

  return {
    type,
    exercises: templateItems.map((item) => ({
      exerciseId: item.exerciseId,
      name: item.name,
      description: item.description ?? "",
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
