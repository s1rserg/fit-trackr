"use client";

import { useMemo } from "react";
import { type Control, useWatch } from "react-hook-form";

import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";

interface WorkoutLiveSummaryProps {
  control: Control<ActiveWorkoutSubmission>;
  totalExercisesCount: number;
}

export function WorkoutLiveSummary({
  control,
  totalExercisesCount,
}: WorkoutLiveSummaryProps) {
  const exercisesWatch = useWatch({
    control,
    name: "exercises",
  }) || [];

  const { totalVolume, completedExercisesCount } = useMemo(() => {
    let volume = 0;
    let completedCount = 0;

    for (const ex of exercisesWatch) {
      const targetSets = ex.targetSets || 3;
      const completedSets = ex.setLogs ? ex.setLogs.filter((s) => s.completed && s.reps > 0) : [];
      if (completedSets.length >= targetSets) {
        completedCount += 1;
      }

      if (ex.setLogs) {
        for (const setLog of ex.setLogs) {
          if (setLog.completed && setLog.weight > 0 && setLog.reps > 0) {
            volume += setLog.weight * setLog.reps;
          }
        }
      }
    }

    return {
      totalVolume: volume,
      completedExercisesCount: completedCount,
    };
  }, [exercisesWatch]);

  return (
    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-sm">
      <div className="flex items-center gap-1.5 font-mono text-zinc-400">
        <span>Volume:</span>
        <strong className="text-zinc-100 font-semibold">
          {totalVolume.toLocaleString()} kg
        </strong>
      </div>
      <span className="font-mono text-xs text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
        {completedExercisesCount} / {totalExercisesCount} Completed
      </span>
    </div>
  );
}
