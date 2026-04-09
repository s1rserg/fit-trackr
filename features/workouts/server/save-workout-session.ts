"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { exerciseSets, exercises, workouts } from "@/db/schema";
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

    const insertedExercises = await db
      .insert(exercises)
      .values(
        completedExercises.map((exercise) => {
          const summary = summarizeCompletedSets(exercise.setLogs, exercise.progressMetric);

          return {
            workoutId: workout.id,
            name: exercise.name,
            description: exercise.description,
            note: exercise.note.trim() || null,
            progressMetric: exercise.progressMetric,
            weight: summary.weight,
            sets: exercise.targetSets,
            reps: exercise.targetReps,
            orderIndex: exercise.orderIndex,
          };
        }),
      )
      .returning();

    await db.insert(exerciseSets).values(
      insertedExercises.flatMap((exerciseRow) => {
        const matchingExercise = completedExercises.find(
          (item) =>
            item.name === exerciseRow.name && item.orderIndex === exerciseRow.orderIndex,
        );

        if (!matchingExercise) {
          return [];
        }

        return matchingExercise.setLogs.map((setLog) => ({
          exerciseId: exerciseRow.id,
          setIndex: setLog.setIndex,
          weight: setLog.weight,
          reps: setLog.reps,
          completed: setLog.completed,
        }));
      }),
    );

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
