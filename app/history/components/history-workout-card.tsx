import { CalendarRange, ChevronDown, Dumbbell, MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { workoutMeta, type WorkoutType } from "@/features/workouts/config";
import type { getWorkoutHistory } from "@/features/workouts/server/queries";

type HistoryWorkoutCardProps = {
  workout: Awaited<ReturnType<typeof getWorkoutHistory>>[number];
  formatWorkoutDate: (date: Date | string) => string;
};

export function HistoryWorkoutCard({
  workout,
  formatWorkoutDate,
}: HistoryWorkoutCardProps) {
  const meta = workoutMeta[workout.type as WorkoutType] || {
    title: `Workout ${workout.type}`,
    subtitle: "",
  };

  return (
    <Card className="glass-card border border-purple-500/20 shadow-xl overflow-hidden rounded-3xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/20 text-purple-300 font-extrabold text-lg flex items-center justify-center border border-primary/30 shadow-md">
              {workout.type}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-widest font-bold text-purple-300">
                  {meta.title}
                </p>
                {meta.subtitle && (
                  <span className="text-xs text-purple-300/60 font-medium">({meta.subtitle})</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {formatWorkoutDate(workout.dateCompleted)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-purple-950/60 border border-purple-500/20 px-3 py-1 text-xs text-purple-200 font-medium">
            <CalendarRange className="h-3.5 w-3.5 text-purple-400" />
            {workout.performedExercises.length} exercises
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-1">
        <details className="group rounded-2xl border border-purple-500/15 bg-secondary/20 p-3.5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-purple-200">
            <span className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4 text-purple-400" /> View Exercise Logs
            </span>
            <ChevronDown className="h-4 w-4 text-purple-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3.5 space-y-2.5">
            {workout.performedExercises.map((performedExercise: typeof workout.performedExercises[number]) => (
              <div
                key={`${workout.id}-${performedExercise.id}`}
                className="rounded-xl border border-purple-500/15 bg-purple-950/40 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-white">{performedExercise.exercise.name}</p>
                    {performedExercise.note ? (
                      <p className="mt-1 text-xs text-purple-300/90 flex items-center gap-1 font-mono bg-purple-900/30 px-2 py-1 rounded-lg border border-purple-500/20">
                        <MessageSquare className="h-3 w-3 text-purple-400 flex-shrink-0" />
                        {performedExercise.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-base font-extrabold text-white">
                      {performedExercise.weight} kg
                    </p>
                    <p className="text-xs text-purple-300/80">
                      {performedExercise.reps} reps
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
