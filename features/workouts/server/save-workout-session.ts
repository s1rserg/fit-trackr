"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { performedExercises, workouts } from "@/db/schema";
import {
  activeWorkoutSubmissionSchema,
  type ActiveWorkoutSubmission,
} from "@/features/workouts/schemas";
import { summarizeCompletedSets } from "@/features/workouts/utils";
import type { SaveWorkoutSessionResult } from "./types";

export async function saveWorkoutSession(
  input: ActiveWorkoutSubmission,
): Promise<SaveWorkoutSessionResult> {
  const parsed = activeWorkoutSubmissionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid workout payload.",
    };
  }

  const completedExercises = parsed.data.exercises.filter((exercise) =>
    exercise.setLogs.some((setLog) => setLog.completed),
  );

  if (completedExercises.length === 0) {
    return {
      success: false,
      error: "Complete at least one exercise before finishing the workout.",
    };
  }

  try {
    const [workout] = await db
      .insert(workouts)
      .values({
        type: parsed.data.type,
        dateCompleted: new Date(),
      })
      .returning();

    await db
      .insert(performedExercises)
      .values(
        completedExercises.map((exercise) => {
          const summary = summarizeCompletedSets(exercise.setLogs, exercise.progressMetric);

          return {
            workoutId: workout.id,
            exerciseId: exercise.exerciseId,
            note: exercise.note.trim() || null,
            weight: summary.weight,
            reps: summary.reps,
            orderIndex: exercise.orderIndex,
          };
        }),
      )
      .returning();

    revalidatePath("/");
    revalidatePath("/history");
    revalidatePath("/progress");
    revalidatePath(`/workouts/${parsed.data.type}`);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Unable to save workout right now.",
    };
  }
}
