import "server-only";

import { count } from "drizzle-orm";

import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function getWorkoutCount(): Promise<number> {
  const [result] = await db.select({ total: count() }).from(workouts);
  return Number(result?.total ?? 0);
}
