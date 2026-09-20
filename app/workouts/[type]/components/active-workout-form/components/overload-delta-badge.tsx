"use client";

import type { ParsedSet } from "@/features/workouts/parser";

interface OverloadDeltaBadgeProps {
  currentSets: readonly ParsedSet[];
  previousWeight: number;
  previousReps: number;
}

export function OverloadDeltaBadge({
  currentSets,
  previousWeight,
  previousReps,
}: OverloadDeltaBadgeProps) {
  if (currentSets.length === 0 || previousWeight <= 0) {
    return null;
  }

  // Find top working weight from current sets
  const topCurrentWeight = Math.max(...currentSets.map((s) => s.weight));
  const topSet = currentSets.find((s) => s.weight === topCurrentWeight) ?? currentSets[0];
  const topCurrentReps = topSet.reps;

  // Weight progression
  if (topCurrentWeight > previousWeight) {
    const delta = Math.round((topCurrentWeight - previousWeight) * 10) / 10;
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
        +{delta} kg ↑
      </span>
    );
  }

  // Same weight, reps progression
  if (topCurrentWeight === previousWeight && topCurrentReps > previousReps) {
    const deltaReps = topCurrentReps - previousReps;
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
        +{deltaReps} rep{deltaReps > 1 ? "s" : ""} ↑
      </span>
    );
  }

  // Matched last session exactly
  if (topCurrentWeight === previousWeight && topCurrentReps === previousReps) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
        Matched =
      </span>
    );
  }

  // Below last session
  if (topCurrentWeight < previousWeight && topCurrentWeight > 0) {
    const drop = Math.round((previousWeight - topCurrentWeight) * 10) / 10;
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-zinc-900 text-zinc-500 border border-zinc-800">
        -{drop} kg
      </span>
    );
  }

  return null;
}
