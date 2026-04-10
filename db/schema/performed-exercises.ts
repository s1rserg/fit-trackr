import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

import { exercises } from "./exercises";
import { workouts } from "./workouts";

export const performedExercises = pgTable("performed_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  note: text("note"),
  weight: integer("weight").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  orderIndex: integer("order_index").notNull(),
});
