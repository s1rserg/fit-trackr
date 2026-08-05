"use client";

import { Dumbbell, LoaderCircle, Save, Timer, X, Flame } from "lucide-react";

import { useTimer } from "@/components/timer-context";
import { Button } from "@/components/ui/button";
import { workoutMeta } from "@/features/workouts/config";
import { ExerciseCard } from "./components";
import type { ActiveWorkoutFormProps } from "./types";
import { useActiveWorkoutForm } from "./use-active-workout-form";

export function ActiveWorkoutForm({ workout }: ActiveWorkoutFormProps) {
  const {
    error,
    expandedExercises,
    form,
    handleCancelWorkout,
    isPending,
    onSubmit,
    toggleExerciseDetails,
  } = useActiveWorkoutForm(workout);

  const { openTimer } = useTimer();

  const exercisesWatch = form.watch("exercises");
  const meta = workoutMeta[workout.type];

  // Calculate live total session volume (weight * reps for completed sets)
  const totalVolume = exercisesWatch.reduce((totalAcc, ex) => {
    const exVolume = ex.setLogs.reduce((setAcc, setLog) => {
      if (setLog.completed && setLog.weight > 0 && setLog.reps > 0) {
        return setAcc + setLog.weight * setLog.reps;
      }
      return setAcc;
    }, 0);
    return totalAcc + exVolume;
  }, 0);

  const completedSetsCount = exercisesWatch.reduce((acc, ex) => {
    return acc + ex.setLogs.filter((s) => s.completed).length;
  }, 0);

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-1 flex-col max-w-2xl mx-auto w-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 mb-4 rounded-3xl p-4 glass-card purple-glow border border-primary/30 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-purple-300 bg-primary/20 px-2.5 py-0.5 rounded-full border border-primary/30">
                {meta.title}
              </span>
              <span className="text-xs text-purple-200/70 font-medium hidden sm:inline">
                {meta.subtitle}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mt-0.5">
              Active Session
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openTimer}
              className="h-9 gap-1.5 rounded-2xl border-purple-500/30 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60"
            >
              <Timer className="h-4 w-4 text-purple-400" />
              <span className="hidden sm:inline">Rest Timer</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancelWorkout}
              aria-label="Cancel workout"
              className="h-9 w-9 rounded-2xl text-muted-foreground hover:text-white hover:bg-purple-950/40"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Live Volume & Completed Sets Banner */}
        <div className="mt-3 pt-3 border-t border-purple-500/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-purple-200">
            <Flame className="h-4 w-4 text-amber-400" />
            <span>Total Volume: </span>
            <strong className="text-white font-bold text-sm">
              {totalVolume.toLocaleString()} kg
            </strong>
          </div>
          <span className="font-mono text-purple-300 font-semibold bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            {completedSetsCount} / 21 Sets Done
          </span>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4 pb-32">
        {workout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.name}
            exercise={exercise}
            exerciseIndex={index}
            form={form}
            isExpanded={expandedExercises[index] ?? false}
            onToggleDetails={() => toggleExerciseDetails(index)}
          />
        ))}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-5">
        <div className="rounded-3xl p-4 glass-card purple-glow border border-primary/40 shadow-2xl backdrop-blur-xl">
          {error ? (
            <p className="mb-3 text-xs font-semibold text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
              {error}
            </p>
          ) : (
            <p className="mb-3 flex items-center gap-2 text-xs text-purple-300/80">
              <Dumbbell className="h-4 w-4 text-primary" />
              Toggle "All done" on exercises to complete them quickly.
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-purple-600/30 active:scale-[0.99] transition-all"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                Saving Workout...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Finish Workout
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
