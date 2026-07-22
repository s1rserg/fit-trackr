"use client";

import { ChevronDown, ChevronUp, Flame, MessageSquare } from "lucide-react";

import { PlateCalculatorDialog } from "@/components/plate-calculator-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";
import type { ActiveWorkoutExercise } from "@/features/workouts/types";
import type { UseFormReturn } from "react-hook-form";

import { QuickSetControls } from "./quick-set-controls";
import { SetLogEditor } from "./set-log-editor";

type ExerciseCardProps = {
  exercise: ActiveWorkoutExercise;
  exerciseIndex: number;
  form: UseFormReturn<ActiveWorkoutSubmission>;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onTriggerRestTimer?: () => void;
};

export function ExerciseCard({
  exercise,
  exerciseIndex,
  form,
  isExpanded,
  onToggleDetails,
  onTriggerRestTimer,
}: ExerciseCardProps) {
  const setLogs = form.watch(`exercises.${exerciseIndex}.setLogs`);
  const hasSavedNote = exercise.note.trim().length > 0;

  // Calculate estimated 1RM (Brzycki Formula: W * 36 / (37 - R))
  const firstCompletedOrValidSet = setLogs[0];
  const topWeight = firstCompletedOrValidSet?.weight || 0;
  const topReps = firstCompletedOrValidSet?.reps || 0;

  const estimated1RM =
    topWeight > 0 && topReps > 0 && topReps < 37
      ? Math.round(topWeight * (36 / (37 - topReps)))
      : 0;

  return (
    <Card className="glass-card border border-purple-500/20 shadow-xl overflow-hidden rounded-3xl">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-purple-300 font-mono text-xs font-bold flex items-center justify-center border border-primary/30">
                {exerciseIndex + 1}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">{exercise.name}</h2>
            </div>
            <p className="text-xs font-medium text-purple-300/80">
              Target: <span className="text-white">{exercise.targetSets} sets × {exercise.targetReps} reps</span>
            </p>
            {exercise.description ? (
              <p className="text-xs text-muted-foreground/80 mt-1">{exercise.description}</p>
            ) : null}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {exercise.progressMetric === "weight" && topWeight > 0 && (
              <PlateCalculatorDialog defaultWeight={topWeight} />
            )}
            {estimated1RM > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                <Flame className="h-3 w-3 text-amber-400" /> Est 1RM ~ {estimated1RM}kg
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Note Input */}
          <div className="rounded-2xl border border-purple-500/15 bg-secondary/20 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Label
                htmlFor={`exercise-note-${exerciseIndex}`}
                className="text-[11px] uppercase tracking-[0.2em] font-semibold text-purple-300/80 flex items-center gap-1"
              >
                <MessageSquare className="h-3 w-3 text-purple-400" /> Note for next time
              </Label>
              {hasSavedNote ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Previous log loaded
                </span>
              ) : null}
            </div>
            <Input
              id={`exercise-note-${exerciseIndex}`}
              placeholder="e.g. 50x2x12. 50x10. Seat position #3"
              maxLength={240}
              className="bg-secondary/40 border-purple-500/20 text-white placeholder:text-muted-foreground/50 text-xs focus-visible:ring-purple-500"
              {...form.register(`exercises.${exerciseIndex}.note`)}
            />
          </div>

          {/* Quick Controls */}
          <QuickSetControls
            exerciseIndex={exerciseIndex}
            form={form}
            setLogs={setLogs}
            onSetCompleted={onTriggerRestTimer}
          />

          {/* Toggle Individual Sets */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-between rounded-xl border-purple-500/20 bg-secondary/30 text-xs font-medium text-purple-200 hover:bg-purple-950/40"
            onClick={onToggleDetails}
          >
            <span>Adjust sets individually</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {isExpanded ? (
            <div className="space-y-2.5 pt-1">
              {setLogs.map((setLog, setIndex) => (
                <SetLogEditor
                  key={`${exercise.name}-${setLog.setIndex}`}
                  exerciseIndex={exerciseIndex}
                  form={form}
                  setLog={setLog}
                  setIndex={setIndex}
                />
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
