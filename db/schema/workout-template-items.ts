import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

import { workoutTypeEnum } from "./enums";
import { exercises } from "./exercises";

export const workoutTemplateItems = pgTable("workout_template_items", {
  id: serial("id").primaryKey(),
  workoutType: workoutTypeEnum("workout_type").notNull(),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  targetSets: integer("target_sets").notNull().default(3),
  targetReps: text("target_reps").notNull().default("10-12"),
});
