import { relations } from "drizzle-orm";

import { exerciseSets } from "./exercise-sets";
import { exercises } from "./exercises";
import { workouts } from "./workouts";

export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
  setLogs: many(exerciseSets),
}));

export const exerciseSetsRelations = relations(exerciseSets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseSets.exerciseId],
    references: [exercises.id],
  }),
}));
