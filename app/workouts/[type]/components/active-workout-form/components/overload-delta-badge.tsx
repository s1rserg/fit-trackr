"use client";

import { memo } from "react";

import type { ParsedSet } from "@/features/workouts/parser";

interface OverloadDeltaBadgeProps {
  currentSets: readonly ParsedSet[];
  previousSets?: readonly ParsedSet[];
  previousWeight: number;
  previousReps: number;
}

export const OverloadDeltaBadge = memo(function OverloadDeltaBadge({
  currentSets,
  previousSets = [],
  previousWeight,
  previousReps,
}: OverloadDeltaBadgeProps) {
  if (currentSets.length === 0) {
    return null;
  }

  // 1. Determine top working weight for today vs previous
  const topCurrentWeight = Math.max(...currentSets.map((s) => s.weight));
  const topPreviousWeight =
    previousSets.length > 0
      ? Math.max(...previousSets.map((s) => s.weight))
      : previousWeight;

  // Weight progression (e.g. 65kg vs 60kg)
  if (topCurrentWeight > topPreviousWeight && topPreviousWeight > 0) {
    const delta = Math.round((topCurrentWeight - topPreviousWeight) * 10) / 10;
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
        +{delta} kg ↑
      </span>
    );
  }

  // Weight drop (e.g. 55kg vs 60kg)
  if (topCurrentWeight < topPreviousWeight && topCurrentWeight > 0) {
    const drop = Math.round((topPreviousWeight - topCurrentWeight) * 10) / 10;
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-medium bg-zinc-900 text-zinc-500 border border-zinc-800">
        -{drop} kg
      </span>
    );
  }

  // 2. Weights are identical (or bodyweight / zero-weight exercises)
  // Compare reps!
  if (previousSets.length > 0) {
    // Compare up to the number of sets entered so far
    const numSetsToCompare = Math.min(currentSets.length, previousSets.length);

    if (numSetsToCompare > 0) {
      const currentRepsSum = currentSets
        .slice(0, numSetsToCompare)
        .reduce((acc, s) => acc + s.reps, 0);

      const previousRepsSum = previousSets
        .slice(0, numSetsToCompare)
        .reduce((acc, s) => acc + s.reps, 0);

      const deltaReps = currentRepsSum - previousRepsSum;

      if (deltaReps > 0) {
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
            +{deltaReps} rep{deltaReps > 1 ? "s" : ""} ↑
          </span>
        );
      }

      if (deltaReps < 0) {
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-medium bg-zinc-900 text-zinc-500 border border-zinc-800">
            {deltaReps} reps
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
          Matched =
        </span>
      );
    }
  }

  // Fallback: compare top set reps against previousReps
  if (previousReps > 0) {
    const topCurrentReps = Math.max(...currentSets.map((s) => s.reps));
    const deltaReps = topCurrentReps - previousReps;

    if (deltaReps > 0) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
          +{deltaReps} rep{deltaReps > 1 ? "s" : ""} ↑
        </span>
      );
    }

    if (deltaReps < 0) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-medium bg-zinc-900 text-zinc-500 border border-zinc-800">
          {deltaReps} reps
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
        Matched =
      </span>
    );
  }

  return null;
});
