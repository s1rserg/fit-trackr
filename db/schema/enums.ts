import { pgEnum } from "drizzle-orm/pg-core";

export const workoutTypeEnum = pgEnum("workout_type", ["A", "B", "C"]);
export const progressMetricEnum = pgEnum("progress_metric", ["weight", "reps"]);
export const exerciseScopeEnum = pgEnum("exercise_scope", ["A", "B", "C", "both", "all"]);
