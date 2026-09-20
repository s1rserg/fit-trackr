"use server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { performedExercises, workouts } from "@/db/schema";

export type ExerciseRecentHistoryItem = {
  workoutId: number;
  workoutType: string;
  dateCompleted: Date;
  weight: number;
  reps: number;
  note: string | null;
};

export async function getExerciseRecentHistory(
  exerciseId: number,
  limit: number = 5,
): Promise<ExerciseRecentHistoryItem[]> {
  if (!exerciseId || exerciseId <= 0) {
    return [];
  }

  try {
    const rows = await db
      .select({
        workoutId: workouts.id,
        workoutType: workouts.type,
        dateCompleted: workouts.dateCompleted,
        weight: performedExercises.weight,
        reps: performedExercises.reps,
        note: performedExercises.note,
      })
      .from(performedExercises)
      .innerJoin(workouts, eq(performedExercises.workoutId, workouts.id))
      .where(eq(performedExercises.exerciseId, exerciseId))
      .orderBy(desc(workouts.dateCompleted), desc(workouts.id))
      .limit(limit);

    return rows;
  } catch (error) {
    console.error("Failed to fetch exercise recent history:", error);
    return [];
  }
}
