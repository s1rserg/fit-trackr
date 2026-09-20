"use client";

import { useMemo } from "react";
import { Check, LoaderCircle, Timer, X } from "lucide-react";

import { useTimer } from "@/components/timer-context";
import { Button } from "@/components/ui/button";
import { WORKOUT_METADATA } from "@/features/workouts/constants";
import { ExerciseCard } from "./components";
import type { ActiveWorkoutFormProps } from "./types";
import { useActiveWorkoutForm } from "./use-active-workout-form";

export function ActiveWorkoutForm({ workout }: ActiveWorkoutFormProps) {
  const {
    error,
    form,
    handleCancelWorkout,
    isPending,
    onSubmit,
  } = useActiveWorkoutForm(workout);

  const { openTimer } = useTimer();
  const exercisesWatch = form.watch("exercises");
  const meta = WORKOUT_METADATA[workout.type];

  // Calculate live volume, completed count, and completed IDs
  const { totalVolume, completedExercisesCount, completedExerciseIds } = useMemo(() => {
    let volume = 0;
    let completedCount = 0;
    const completedIds = new Set<number>();

    for (const ex of exercisesWatch) {
      const isDone = ex.setLogs.length > 0 && ex.setLogs.every((s) => s.completed);
      if (isDone) {
        completedCount += 1;
        completedIds.add(ex.exerciseId);
      }

      for (const setLog of ex.setLogs) {
        if (setLog.completed && setLog.weight > 0 && setLog.reps > 0) {
          volume += setLog.weight * setLog.reps;
        }
      }
    }

    return {
      totalVolume: volume,
      completedExercisesCount: completedCount,
      completedExerciseIds: completedIds,
    };
  }, [exercisesWatch]);

  const handleJumpToExercise = (targetIndex: number) => {
    const targetElement = document.getElementById(`exercise-card-${targetIndex}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      targetElement.classList.add("ring-2", "ring-emerald-500/80");
      setTimeout(() => {
        targetElement.classList.remove("ring-2", "ring-emerald-500/80");
      }, 2500);
    }
  };

  const totalExercisesCount = workout.exercises.length;

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-1 flex-col max-w-2xl mx-auto w-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 mb-4 rounded-2xl p-4 athletic-card shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                {meta.title}
              </span>
              <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                {meta.subtitle}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">
              Active Session
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openTimer}
              className="h-8 gap-1.5 rounded-xl border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Timer className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs hidden sm:inline">Timer</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancelWorkout}
              aria-label="Cancel workout"
              className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Live Volume & Completed Summary */}
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-mono text-zinc-400">
            <span>Volume:</span>
            <strong className="text-zinc-100 font-semibold">
              {totalVolume.toLocaleString()} kg
            </strong>
          </div>
          <span className="font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
            {completedExercisesCount} / {totalExercisesCount} Completed
          </span>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-3.5 pb-32">
        {workout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.name}
            exercise={exercise}
            exerciseIndex={index}
            form={form}
            allExercises={workout.exercises}
            completedExerciseIds={completedExerciseIds}
            onJumpToExercise={handleJumpToExercise}
          />
        ))}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-5">
        <div className="rounded-2xl p-3 athletic-card shadow-2xl backdrop-blur-xl">
          {error && (
            <p className="mb-2.5 text-xs font-semibold text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm shadow-md active:scale-[0.99] transition-all"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Saving Session...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Finish Workout
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
