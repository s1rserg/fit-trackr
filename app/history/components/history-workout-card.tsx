import { CalendarRange, ChevronDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getWorkoutHistory } from "@/features/workouts/server/queries";

type HistoryWorkoutCardProps = {
  workout: Awaited<ReturnType<typeof getWorkoutHistory>>[number];
  formatWorkoutDate: (date: Date | string) => string;
};

export function HistoryWorkoutCard({
  workout,
  formatWorkoutDate,
}: HistoryWorkoutCardProps) {
  return (
    <Card key={workout.id}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">
              Workout {workout.type}
            </p>
            <CardTitle className="mt-1 text-xl">
              {formatWorkoutDate(workout.dateCompleted)}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            {workout.performedExercises.length} exercises
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <details className="group rounded-2xl border border-border/70 bg-secondary/30 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
            Show exercise details
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 space-y-3">
            {workout.performedExercises.map((performedExercise) => (
              <div
                key={`${workout.id}-${performedExercise.id}`}
                className="rounded-2xl bg-background/50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{performedExercise.exercise.name}</p>
                    <p className="text-sm text-muted-foreground">Logged result</p>
                    {performedExercise.exercise.description ? (
                      <p className="text-sm text-muted-foreground/90">
                        {performedExercise.exercise.description}
                      </p>
                    ) : null}
                    {performedExercise.note ? (
                      <p className="mt-2 text-sm text-muted-foreground/90">
                        Note: {performedExercise.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{performedExercise.weight} kg</p>
                    <p className="text-xs text-muted-foreground">
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
