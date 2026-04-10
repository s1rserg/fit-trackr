import "server-only";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { performedExercises, workouts } from "@/db/schema";

type LastPerformance = {
  note: string;
  workoutDate: Date | null;
  weight: number;
  reps: number;
};

export async function getLastPerformanceByExerciseIds(exerciseIds: number[]) {
  if (exerciseIds.length === 0) {
    return new Map<number, LastPerformance>();
  }

  const rows = await db
    .select({
      exerciseId: performedExercises.exerciseId,
      note: performedExercises.note,
      workoutDate: workouts.dateCompleted,
      weight: performedExercises.weight,
      reps: performedExercises.reps,
    })
    .from(performedExercises)
    .innerJoin(workouts, eq(performedExercises.workoutId, workouts.id))
    .where(inArray(performedExercises.exerciseId, exerciseIds))
    .orderBy(desc(workouts.dateCompleted), desc(workouts.id), desc(performedExercises.id));

  const latest = new Map<number, LastPerformance>();

  for (const row of rows) {
    if (!latest.has(row.exerciseId)) {
      latest.set(row.exerciseId, {
        note: row.note ?? "",
        workoutDate: row.workoutDate,
        weight: row.weight,
        reps: row.reps,
      });
    }
  }

  return latest;
}
