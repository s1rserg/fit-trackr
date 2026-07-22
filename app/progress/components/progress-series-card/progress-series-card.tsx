import { Activity, TrendingUp, Trophy } from "lucide-react";

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
    <Card className="glass-card border border-purple-500/20 shadow-xl overflow-hidden rounded-3xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-extrabold text-white tracking-tight">
                {series.name}
              </CardTitle>
              {series.currentValue >= series.bestValue && series.entriesCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Trophy className="h-3 w-3" /> PR
                </span>
              )}
            </div>
            {series.description ? (
              <p className="mt-1 text-xs text-purple-300/80">{series.description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            {delta === null
              ? "Baseline"
              : `${delta >= 0 ? "+" : ""}${delta} ${series.progressMetric === "reps" ? "reps" : "kg"}`}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-1">
        <ExerciseProgressChart series={series} />
        <div className="mt-3.5 flex items-center gap-2 text-xs text-purple-300/70 font-medium">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span>
            Working set: <strong className="text-white">{series.currentWeight} kg × {series.currentReps} reps</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
