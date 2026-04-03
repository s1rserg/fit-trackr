import { boolean, integer, pgTable, serial } from "drizzle-orm/pg-core";

import { exercises } from "./exercises";

export const exerciseSets = pgTable("exercise_sets", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  setIndex: integer("set_index").notNull(),
  weight: integer("weight").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
});
