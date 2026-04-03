import "server-only";

import { asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { exerciseSets, exercises, workouts } from "@/db/schema";
import { getDefaultRepsValue } from "@/features/workouts/utils";

type LastPerformance = {
  description: string;
  progressMetric: "weight" | "reps";
  workoutDate: Date | null;
  setLogs: { setIndex: number; weight: number; reps: number; completed: boolean }[];
};

export async function getLastPerformanceByExerciseNames(names: string[]) {
  if (names.length === 0) {
    return new Map<string, LastPerformance>();
  }

  const rows = await db
    .select({
      exerciseId: exercises.id,
      name: exercises.name,
      description: exercises.description,
      progressMetric: exercises.progressMetric,
      targetSets: exercises.sets,
      targetReps: exercises.reps,
      workoutDate: workouts.dateCompleted,
      setId: exerciseSets.id,
      setIndex: exerciseSets.setIndex,
      setWeight: exerciseSets.weight,
      setReps: exerciseSets.reps,
      setCompleted: exerciseSets.completed,
    })
    .from(exercises)
    .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
    .leftJoin(exerciseSets, eq(exerciseSets.exerciseId, exercises.id))
    .where(inArray(exercises.name, names))
    .orderBy(
      desc(workouts.dateCompleted),
      desc(workouts.id),
      asc(exercises.orderIndex),
      asc(exerciseSets.setIndex),
    );

  const latest = new Map<string, LastPerformance>();
  const exerciseIds = new Map<string, number>();

  for (const row of rows) {
    const currentExerciseId = exerciseIds.get(row.name);

    if (currentExerciseId === undefined) {
      exerciseIds.set(row.name, row.exerciseId);
      latest.set(row.name, {
        description: row.description ?? "",
        progressMetric: row.progressMetric,
        workoutDate: row.workoutDate,
        setLogs: [],
      });
    }

    if (exerciseIds.get(row.name) !== row.exerciseId) {
      continue;
    }

    const item = latest.get(row.name);

    if (!item) {
      continue;
    }

    if (row.setId !== null) {
      item.setLogs.push({
        setIndex: row.setIndex ?? 1,
        weight: row.setWeight ?? 0,
        reps: row.setReps ?? 0,
        completed: row.setCompleted ?? false,
      });
      continue;
    }

    if (item.setLogs.length === 0) {
      for (let index = 1; index <= row.targetSets; index += 1) {
        item.setLogs.push({
          setIndex: index,
          weight: 0,
          reps: getDefaultRepsValue(row.targetReps),
          completed: false,
        });
      }
    }
  }

  return latest;
}
