"use client";

import { memo, useMemo, useState } from "react";
import { ArrowRightLeft, Copy, History } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";
import type { ActiveWorkoutExercise } from "@/features/workouts/types";

import { EditableDescription } from "./editable-description";
import { ExerciseHistorySheet } from "./exercise-history-sheet";
import { MachineBusyModal } from "./machine-busy-modal";
import { OverloadDeltaBadge } from "./overload-delta-badge";
import { ParsedChipsPreview } from "./parsed-chips-preview";
import { useShorthandEntry } from "./use-shorthand-entry";

interface ExerciseCardProps {
  exercise: ActiveWorkoutExercise;
  exerciseIndex: number;
  form: UseFormReturn<ActiveWorkoutSubmission>;
  allExercises: ActiveWorkoutExercise[];
  onJumpToExercise: (targetIndex: number) => void;
}

const EMPTY_SET = new Set<number>();

export const ExerciseCard = memo(function ExerciseCard({
  exercise,
  exerciseIndex,
  form,
  allExercises,
  onJumpToExercise,
}: ExerciseCardProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBusyModalOpen, setIsBusyModalOpen] = useState(false);

  // Compute completedExerciseIds on demand only when busy modal is active
  const completedExerciseIds = useMemo(() => {
    if (!isBusyModalOpen) return EMPTY_SET;
    const exercises = form.getValues("exercises") || [];
    const ids = new Set<number>();
    for (const ex of exercises) {
      const targetSets = ex.targetSets || 3;
      const completedSets = ex.setLogs ? ex.setLogs.filter((s) => s.completed && s.reps > 0) : [];
      if (completedSets.length >= targetSets) {
        ids.add(ex.exerciseId);
      }
    }
    return ids;
  }, [isBusyModalOpen, form]);

  const {
    rawText,
    parsed,
    parsedPrevious,
    previousSets,
    previousWeight,
    previousReps,
    isCompleted,
    fallbackWeight,
    handleTextChange,
    handleToggleComplete,
    applyPreviousNote,
  } = useShorthandEntry(exercise, exerciseIndex, form);

  return (
    <div
      id={`exercise-card-${exerciseIndex}`}
      className="athletic-card rounded-2xl p-4 transition-all duration-300"
    >
      {/* Exercise Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-xs font-bold flex items-center justify-center border border-zinc-700">
              {exerciseIndex + 1}
            </span>

            {/* Clickable Exercise Name for History Drawer (no extra icon) */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="text-left group cursor-pointer"
              title="Click to view history"
            >
              <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-zinc-300 transition-colors">
                {exercise.name}
              </h2>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {fallbackWeight > 0 && (
              <span className="text-xs font-mono font-medium text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                {fallbackWeight}kg
              </span>
            )}

            {/* Station Busy Icon Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsBusyModalOpen(true)}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-zinc-800"
              title="Station busy / Find alternative"
              aria-label="Station busy"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editable Description (Double-click/tap to edit) */}
        <EditableDescription
          exerciseId={exercise.exerciseId}
          initialDescription={exercise.description}
        />
      </div>

      {/* Previous Session Reference */}
      {exercise.note && (
        <div className="mt-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-zinc-500" /> Last Session
            </span>
            <button
              type="button"
              onClick={applyPreviousNote}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              title="Copy to current session"
            >
              <Copy className="h-3 w-3" />
              <span>Use</span>
            </button>
          </div>

          <p className="text-sm font-mono text-zinc-200">{exercise.note}</p>
          {parsedPrevious && <ParsedChipsPreview chips={parsedPrevious.chips} />}
        </div>
      )}

      {/* Shorthand Input & Done Checkbox */}
      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1.5">
              <Label
                htmlFor={`shorthand-${exerciseIndex}`}
                className="text-xs uppercase tracking-wider text-zinc-400 font-medium"
              >
                Log Sets
              </Label>

              {/* Progressive Overload Delta Badge */}
              <OverloadDeltaBadge
                currentSets={parsed.sets}
                previousSets={previousSets}
                previousWeight={previousWeight}
                previousReps={previousReps}
              />
            </div>

            <Input
              id={`shorthand-${exerciseIndex}`}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={fallbackWeight > 0 ? `r ${fallbackWeight}x12 12 12` : "r 12 12 12"}
              className="bg-zinc-900 border-zinc-700/80 text-white font-mono text-base placeholder:text-zinc-600 focus-visible:ring-zinc-500 h-11"
            />
          </div>

          <div className="flex flex-col items-center space-y-1">
            <Label
              htmlFor={`complete-toggle-${exerciseIndex}`}
              className={`text-xs uppercase tracking-wider font-mono font-semibold transition-colors ${
                isCompleted ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              Done
            </Label>
            <div className="h-11 flex items-center justify-center">
              <Checkbox
                id={`complete-toggle-${exerciseIndex}`}
                checked={isCompleted}
                onCheckedChange={(checked) => handleToggleComplete(checked === true)}
                className="w-8 h-8 rounded-lg border-zinc-700 bg-zinc-900 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-400 data-[state=checked]:shadow-md data-[state=checked]:shadow-emerald-500/25 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Live Parsed Preview Chips */}
        {parsed.chips.length > 0 && <ParsedChipsPreview chips={parsed.chips} />}
      </div>

      {/* Slide-Up History Sheet */}
      {isHistoryOpen && (
        <ExerciseHistorySheet
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          exerciseId={exercise.exerciseId}
          exerciseName={exercise.name}
        />
      )}

      {/* Station Occupied Navigator Modal */}
      {isBusyModalOpen && (
        <MachineBusyModal
          isOpen={isBusyModalOpen}
          onClose={() => setIsBusyModalOpen(false)}
          currentExerciseIndex={exerciseIndex}
          allExercises={allExercises}
          completedExerciseIds={completedExerciseIds}
          onJumpToExercise={onJumpToExercise}
        />
      )}
    </div>
  );
});
