import { integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

import { exerciseScopeEnum, progressMetricEnum } from "./enums";

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  workoutScope: exerciseScopeEnum("workout_scope").notNull().default("both"),
  note: text("note"),
  progressMetric: progressMetricEnum("progress_metric").notNull().default("weight"),
  targetReps: text("target_reps").notNull().default("10-12"),
  orderIndex: integer("order_index").notNull(),
}, (table) => ({
  exerciseNameUnique: uniqueIndex("exercises_name_unique").on(table.name),
}));
