import { relations } from "drizzle-orm";

import { exercises } from "./exercises";
import { performedExercises } from "./performed-exercises";
import { workoutTemplateItems } from "./workout-template-items";
import { workouts } from "./workouts";

export const workoutsRelations = relations(workouts, ({ many }) => ({
  performedExercises: many(performedExercises),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  performedExercises: many(performedExercises),
  templateItems: many(workoutTemplateItems),
}));

export const workoutTemplateItemsRelations = relations(workoutTemplateItems, ({ one }) => ({
  exercise: one(exercises, {
    fields: [workoutTemplateItems.exerciseId],
    references: [exercises.id],
  }),
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
