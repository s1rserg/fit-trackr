"use client";

import { Check, Copy, History } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";
import type { ActiveWorkoutExercise } from "@/features/workouts/types";

import { EditableDescription } from "./editable-description";
import { ParsedChipsPreview } from "./parsed-chips-preview";
import { useShorthandEntry } from "./use-shorthand-entry";

interface ExerciseCardProps {
  exercise: ActiveWorkoutExercise;
  exerciseIndex: number;
  form: UseFormReturn<ActiveWorkoutSubmission>;
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  form,
}: ExerciseCardProps) {
  const {
    rawText,
    parsed,
    parsedPrevious,
    isCompleted,
    fallbackWeight,
    handleTextChange,
    handleToggleComplete,
    applyPreviousNote,
  } = useShorthandEntry(exercise, exerciseIndex, form);

  return (
    <div className="athletic-card rounded-2xl p-4 transition-all">
      {/* Exercise Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-xs font-bold flex items-center justify-center border border-zinc-700">
              {exerciseIndex + 1}
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">{exercise.name}</h2>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
            {exercise.targetSets} × {exercise.targetReps}
            {fallbackWeight > 0 ? ` • ${fallbackWeight}kg` : ""}
          </span>
        </div>

        {/* Editable Description (Double-click/tap to edit) */}
        <EditableDescription
          exerciseId={exercise.exerciseId}
          initialDescription={exercise.description}
        />
      </div>

      {/* Previous Session Reference */}
      {exercise.note && (
        <div className="mt-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
              <History className="h-3 w-3 text-zinc-500" /> Last Session
            </span>
            <button
              type="button"
              onClick={applyPreviousNote}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors"
              title="Copy to current session"
            >
              <Copy className="h-3 w-3" />
              <span>Use</span>
            </button>
          </div>

          <p className="text-xs font-mono text-zinc-300">{exercise.note}</p>
          {parsedPrevious && <ParsedChipsPreview chips={parsedPrevious.chips} />}
        </div>
      )}

      {/* Shorthand Input & Done Checkbox */}
      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-[1fr_auto] gap-2.5 items-end">
          <div className="space-y-1">
            <Label
              htmlFor={`shorthand-${exerciseIndex}`}
              className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium"
            >
              Log Sets (e.g. <span className="font-mono text-zinc-300">r 50x12 12 45x12</span>)
            </Label>
            <Input
              id={`shorthand-${exerciseIndex}`}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={fallbackWeight > 0 ? `r ${fallbackWeight}x12 12 12` : "r 12 12 12"}
              className="bg-zinc-900 border-zinc-700/80 text-white font-mono text-sm placeholder:text-zinc-600 focus-visible:ring-zinc-500 h-10"
            />
          </div>

          <div className="flex flex-col items-center space-y-1">
            <Label
              htmlFor={`complete-toggle-${exerciseIndex}`}
              className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium"
            >
              Done
            </Label>
            <div className="h-10 flex items-center justify-center">
              <Checkbox
                id={`complete-toggle-${exerciseIndex}`}
                checked={isCompleted}
                onCheckedChange={(checked) => handleToggleComplete(checked === true)}
                className="w-7 h-7 rounded-lg border-zinc-700 bg-zinc-900 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Live Parsed Preview Chips */}
        {parsed.chips.length > 0 && <ParsedChipsPreview chips={parsed.chips} />}
      </div>
    </div>
  );
}
