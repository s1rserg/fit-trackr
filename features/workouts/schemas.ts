import { z } from "zod";

export const workoutTypeSchema = z.enum(["A", "B"]);
export const progressMetricSchema = z.enum(["weight", "reps"]);

export const workoutSetLogSchema = z.object({
  setIndex: z.number().int().positive(),
  weight: z.number().int().min(0),
  reps: z.number().int().min(0),
  completed: z.boolean(),
});

export const activeWorkoutExerciseSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  progressMetric: progressMetricSchema,
  targetSets: z.number().int().positive(),
  targetReps: z.string().min(1),
  orderIndex: z.number().int().positive(),
  setLogs: z.array(workoutSetLogSchema).min(1),
});

export const activeWorkoutSubmissionSchema = z.object({
  type: workoutTypeSchema,
  exercises: z.array(activeWorkoutExerciseSchema).min(1),
});

export type ActiveWorkoutSubmission = z.infer<typeof activeWorkoutSubmissionSchema>;
