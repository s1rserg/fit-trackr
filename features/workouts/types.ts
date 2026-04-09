import type { ProgressMetric, WorkoutType } from "./config";

export type WorkoutSetLog = {
  setIndex: number;
  weight: number;
  reps: number;
  completed: boolean;
};

export type ActiveWorkoutExercise = {
  name: string;
  description: string;
  note: string;
  progressMetric: ProgressMetric;
  targetSets: number;
  targetReps: string;
  orderIndex: number;
  previousWorkoutDate: Date | null;
  setLogs: WorkoutSetLog[];
};

export type ActiveWorkoutData = {
  type: WorkoutType;
  exercises: ActiveWorkoutExercise[];
};

export type ExerciseProgressPoint = {
  workoutId: number;
  workoutType: WorkoutType;
  dateCompleted: Date;
  value: number;
  weight: number;
  reps: number;
};

export type ExerciseProgressSeries = {
  name: string;
  description: string;
  progressMetric: ProgressMetric;
  currentValue: number;
  currentWeight: number;
  currentReps: number;
  bestValue: number;
  bestWeight: number;
  bestReps: number;
  entriesCount: number;
  points: ExerciseProgressPoint[];
};
