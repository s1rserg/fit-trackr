"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { evaluateNextBestExercise } from "@/features/workouts/exercise-priorities";
import type { ActiveWorkoutExercise } from "@/features/workouts/types";

interface MachineBusyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExerciseIndex: number;
  allExercises: ActiveWorkoutExercise[];
  completedExerciseIds: Set<number>;
  onJumpToExercise: (targetIndex: number) => void;
}

export function MachineBusyModal({
  isOpen,
  onClose,
  currentExerciseIndex,
  allExercises,
  completedExerciseIds,
  onJumpToExercise,
}: MachineBusyModalProps) {
  const currentExercise = allExercises[currentExerciseIndex];

  // Set of busy exercise IDs
  const [busyExerciseIds, setBusyExerciseIds] = useState<Set<number>>(() => {
    return new Set(currentExercise ? [currentExercise.exerciseId] : []);
  });

  const toggleBusy = (id: number) => {
    setBusyExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Get upcoming uncompleted exercises
  const upcomingUncompleted = useMemo(() => {
    return allExercises.filter((e) => !completedExerciseIds.has(e.exerciseId));
  }, [allExercises, completedExerciseIds]);

  const recommendation = useMemo(() => {
    return evaluateNextBestExercise(busyExerciseIds, allExercises, completedExerciseIds);
  }, [busyExerciseIds, allExercises, completedExerciseIds]);

  if (!isOpen || !currentExercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl athletic-card border border-zinc-800 bg-zinc-950 p-5 shadow-2xl flex flex-col space-y-4 animate-in slide-in-from-bottom-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Station Occupied Navigator
            </h3>
            <p className="text-[11px] text-zinc-400">
              Optimal workout order without pre-fatiguing compound lifts
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Busy Stations Selector */}
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
            Check which stations are currently occupied:
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {upcomingUncompleted.map((ex) => {
              const isBusy = busyExerciseIds.has(ex.exerciseId);
              return (
                <label
                  key={ex.exerciseId}
                  className="flex items-center justify-between p-2 rounded-xl border border-zinc-800/70 bg-zinc-900/40 cursor-pointer hover:bg-zinc-900 transition-colors"
                >
                  <span className="text-xs text-zinc-200 font-medium">{ex.name}</span>
                  <Checkbox
                    checked={isBusy}
                    onCheckedChange={() => toggleBusy(ex.exerciseId)}
                    className="w-5 h-5 rounded-md border-zinc-700 bg-zinc-900 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Recommendation Card */}
        <div
          className={`rounded-xl p-3.5 border ${
            recommendation.shouldWait
              ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
              : "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
          } space-y-2`}
        >
          <div className="flex items-center gap-2">
            {recommendation.shouldWait ? (
              <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            )}
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {recommendation.headline}
            </h4>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{recommendation.rationale}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>

          {!recommendation.shouldWait && recommendation.exercise && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onJumpToExercise(recommendation.exerciseIndex);
                onClose();
              }}
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl"
            >
              Jump to {recommendation.exercise.name}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
