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
            {workout.exercises.length} exercises
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
            {workout.exercises.map((exercise) => (
              <div
                key={`${workout.id}-${exercise.id}`}
                className="rounded-2xl bg-background/50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} planned sets x {exercise.reps} target reps
                    </p>
                    {exercise.description ? (
                      <p className="text-sm text-muted-foreground/90">
                        {exercise.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{exercise.weight} kg</p>
                    <p className="text-xs text-muted-foreground">working set</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  {exercise.setLogs.map((setLog) => (
                    <div
                      key={`${exercise.id}-${setLog.id}`}
                      className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 rounded-2xl border border-border/60 bg-secondary/20 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-muted-foreground">
                        Set {setLog.setIndex}
                      </span>
                      <span>{setLog.weight} kg</span>
                      <span>{setLog.reps} reps</span>
                      <span
                        className={
                          setLog.completed ? "text-primary" : "text-muted-foreground"
                        }
                      >
                        {setLog.completed ? "Done" : "Skipped"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
