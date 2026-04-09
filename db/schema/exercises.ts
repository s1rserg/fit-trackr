import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

import { progressMetricEnum } from "./enums";
import { workouts } from "./workouts";

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  note: text("note"),
  progressMetric: progressMetricEnum("progress_metric").notNull().default("weight"),
  weight: integer("weight").notNull().default(0),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
  orderIndex: integer("order_index").notNull(),
});
