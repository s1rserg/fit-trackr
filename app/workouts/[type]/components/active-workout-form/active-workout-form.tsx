"use client";

import { Dumbbell, LoaderCircle, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-1 flex-col">
      <div className="sticky top-0 z-10 mb-4 rounded-3xl border border-border/60 bg-background/85 p-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Workout {workout.type}
            </p>
            <h1 className="text-2xl font-semibold">Active session</h1>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancelWorkout}
            aria-label="Cancel workout"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 pb-28">
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

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md px-4 pb-4">
        <div className="rounded-3xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur">
          {error ? (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          ) : (
            <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Dumbbell className="h-4 w-4" />
              Use the fast all-sets toggle for normal workouts. Open detailed sets only when
              something differs.
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                Saving workout...
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
