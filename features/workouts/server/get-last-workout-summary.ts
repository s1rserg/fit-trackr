import "server-only";

import { desc } from "drizzle-orm";

import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function getLastWorkoutSummary() {
  const [workout] = await db
    .select()
    .from(workouts)
    .orderBy(desc(workouts.dateCompleted))
    .limit(1);

  return workout ?? null;
}
