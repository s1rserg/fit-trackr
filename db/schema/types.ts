import type { exercises } from "./exercises";
import type { performedExercises } from "./performed-exercises";
import type { workouts } from "./workouts";

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type PerformedExercise = typeof performedExercises.$inferSelect;
export type NewPerformedExercise = typeof performedExercises.$inferInsert;
