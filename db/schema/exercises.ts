import { pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

import { progressMetricEnum } from "./enums";

export const exercises = pgTable(
  "exercises",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    progressMetric: progressMetricEnum("progress_metric").notNull().default("weight"),
  },
  (table) => ({
    exerciseNameUnique: uniqueIndex("exercises_name_unique").on(table.name),
  }),
);
