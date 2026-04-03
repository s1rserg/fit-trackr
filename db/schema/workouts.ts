import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { workoutTypeEnum } from "./enums";

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  type: workoutTypeEnum("type").notNull(),
  dateCompleted: timestamp("date_completed", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
