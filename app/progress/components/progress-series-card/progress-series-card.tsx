import { Activity, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExerciseProgressSeries } from "@/features/workouts/types";

import { ExerciseProgressChart } from "./components";

type ProgressSeriesCardProps = {
  series: ExerciseProgressSeries;
};

export function ProgressSeriesCard({ series }: ProgressSeriesCardProps) {
  const delta =
    series.points.length > 1
      ? series.points[series.points.length - 1].value - series.points[0].value
      : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{series.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {series.description || "Add machine setup notes in the database to see them here."}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            {delta === null
              ? "Start"
              : `${delta >= 0 ? "+" : ""}${delta} ${series.progressMetric === "reps" ? "reps" : "kg"}`}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ExerciseProgressChart series={series} />
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          {series.progressMetric === "reps"
            ? `Progress tracks reps first. Current working set: ${series.currentWeight} kg x ${series.currentReps} reps.`
            : `Progress tracks working weight first. Current working set: ${series.currentWeight} kg x ${series.currentReps} reps.`}{" "}
          Recorded across workout types{" "}
          {Array.from(new Set(series.points.map((point) => point.workoutType))).join(", ")}
        </div>
      </CardContent>
    </Card>
  );
}
