import "server-only";

import { workoutTemplates, type WorkoutType } from "@/features/workouts/config";
import type { ActiveWorkoutData } from "@/features/workouts/types";
import { getDefaultRepsValue } from "@/features/workouts/utils";

import { getLastPerformanceByExerciseNames } from "./get-last-performance-by-exercise-names";

export async function getActiveWorkoutData(type: WorkoutType): Promise<ActiveWorkoutData> {
  const template = workoutTemplates[type];
  const previousPerformance = await getLastPerformanceByExerciseNames(
    template.map((item) => item.name),
  );

  return {
    type,
    exercises: template.map((item) => ({
      name: item.name,
      description: previousPerformance.get(item.name)?.description ?? item.description,
      note: previousPerformance.get(item.name)?.note ?? "",
      progressMetric: previousPerformance.get(item.name)?.progressMetric ?? item.progressMetric,
      targetSets: item.sets,
      targetReps: item.reps,
      orderIndex: item.orderIndex,
      previousWorkoutDate: previousPerformance.get(item.name)?.workoutDate ?? null,
      setLogs:
        previousPerformance.get(item.name)?.setLogs.length
          ? previousPerformance.get(item.name)!.setLogs
          : Array.from({ length: item.sets }, (_, index) => ({
              setIndex: index + 1,
              weight: 0,
              reps: getDefaultRepsValue(item.reps),
              completed: false,
            })),
    })),
  };
}
