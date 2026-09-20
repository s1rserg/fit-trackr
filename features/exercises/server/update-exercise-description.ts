"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { exercises } from "@/db/schema";
import { ROUTES } from "@/features/workouts/constants";

export type UpdateExerciseDescriptionResult = {
  success: boolean;
  error?: string;
};

export async function updateExerciseDescription(
  exerciseId: number,
  newDescription: string,
): Promise<UpdateExerciseDescriptionResult> {
  if (!exerciseId || exerciseId <= 0) {
    return { success: false, error: "Invalid exercise ID." };
  }

  try {
    const trimmed = newDescription.trim();
    await db
      .update(exercises)
      .set({ description: trimmed.length > 0 ? trimmed : null })
      .where(eq(exercises.id, exerciseId));

    revalidatePath(ROUTES.HOME);
    revalidatePath(ROUTES.HISTORY);
    revalidatePath(ROUTES.PROGRESS);
    revalidatePath(ROUTES.WORKOUT("A"));
    revalidatePath(ROUTES.WORKOUT("B"));
    revalidatePath(ROUTES.WORKOUT("C"));

    return { success: true };
  } catch (error) {
    console.error("Failed to update exercise description:", error);
    return { success: false, error: "Database error while updating description." };
  }
}
