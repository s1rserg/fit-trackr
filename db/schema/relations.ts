import { relations } from "drizzle-orm";

import { exercises } from "./exercises";
import { performedExercises } from "./performed-exercises";
import { workouts } from "./workouts";

export const workoutsRelations = relations(workouts, ({ many }) => ({
  performedExercises: many(performedExercises),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  performedExercises: many(performedExercises),
}));

export const performedExercisesRelations = relations(performedExercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [performedExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [performedExercises.exerciseId],
    references: [exercises.id],
  }),
}));
