import { pgEnum } from "drizzle-orm/pg-core";

export const workoutTypeEnum = pgEnum("workout_type", ["A", "B"]);
export const progressMetricEnum = pgEnum("progress_metric", ["weight", "reps"]);
