"use client";

import { useCallback, useRef } from "react";
import { Check, LoaderCircle, Timer, Trash2, X } from "lucide-react";

import { useTimerActions } from "@/components/timer-context";
import { Button } from "@/components/ui/button";
import { WORKOUT_METADATA } from "@/features/workouts/constants";
import { ExerciseCard, WorkoutLiveSummary } from "./components";
import type { ActiveWorkoutFormProps } from "./types";
import { useActiveWorkoutForm } from "./use-active-workout-form";

export function ActiveWorkoutForm({ workout }: ActiveWorkoutFormProps) {
  const {
    error,
    form,
    handleCancelWorkout,
    handleClearSession,
    isPending,
    onSubmit,
  } = useActiveWorkoutForm(workout);

  const clearDialog = useRef<HTMLDialogElement>(null);
  const { openTimer } = useTimerActions();
  const meta = WORKOUT_METADATA[workout.type];

  const handleJumpToExercise = useCallback((targetIndex: number) => {
    const targetElement = document.getElementById(`exercise-card-${targetIndex}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      targetElement.classList.add("ring-2", "ring-emerald-500/80");
      setTimeout(() => {
        targetElement.classList.remove("ring-2", "ring-emerald-500/80");
      }, 2500);
    }
  }, []);

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
              variant="ghost"
              size="icon"
              onClick={() => clearDialog.current?.showModal()}
              disabled={isPending}
              aria-label="Clear session"
              title="Clear session"
              className="h-8 w-8 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

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

        {/* Isolated Live Volume & Completed Summary (re-renders without affecting workout form) */}
        <WorkoutLiveSummary
          control={form.control}
          totalExercisesCount={totalExercisesCount}
        />
      </div>

      <dialog
        ref={clearDialog}
        aria-labelledby="clear-session-title"
        aria-describedby="clear-session-description"
        className="m-auto w-11/12 max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-white backdrop:bg-black/70"
      >
        <h2 id="clear-session-title" className="text-lg font-bold">Clear this session?</h2>
        <p id="clear-session-description" className="mt-2 text-sm text-zinc-400">
          This clears all logged sets, notes, and completion checkmarks for this session.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" autoFocus onClick={() => clearDialog.current?.close()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              handleClearSession();
              clearDialog.current?.close();
            }}
          >
            Clear session
          </Button>
        </div>
      </dialog>

      {/* Exercises List */}
      <div className="space-y-3.5 pb-32">
        {workout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.name}
            exercise={exercise}
            exerciseIndex={index}
            form={form}
            allExercises={workout.exercises}
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
