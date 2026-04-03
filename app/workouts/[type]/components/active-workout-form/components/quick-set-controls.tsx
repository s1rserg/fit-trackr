"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";
import type { UseFormReturn } from "react-hook-form";

type QuickSetControlsProps = {
  exerciseIndex: number;
  form: UseFormReturn<ActiveWorkoutSubmission>;
  setLogs: ActiveWorkoutSubmission["exercises"][number]["setLogs"];
};

export function QuickSetControls({
  exerciseIndex,
  form,
  setLogs,
}: QuickSetControlsProps) {
  const allSetsCompleted = setLogs.every((setLog) => setLog.completed);
  const quickWeight = setLogs[0]?.weight ?? 0;
  const quickReps = setLogs[0]?.reps ?? 0;

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
      <div className="space-y-2">
        <Label htmlFor={`quick-weight-${exerciseIndex}`}>Weight for all sets</Label>
        <Input
          id={`quick-weight-${exerciseIndex}`}
          type="number"
          inputMode="numeric"
          min={0}
          value={quickWeight}
          onChange={(event) => {
            const nextWeight = Number.parseInt(event.target.value, 10) || 0;

            setLogs.forEach((_, setIndex) => {
              form.setValue(`exercises.${exerciseIndex}.setLogs.${setIndex}.weight`, nextWeight, {
                shouldDirty: true,
              });
            });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`quick-reps-${exerciseIndex}`}>Reps for all sets</Label>
        <Input
          id={`quick-reps-${exerciseIndex}`}
          type="number"
          inputMode="numeric"
          min={0}
          value={quickReps}
          onChange={(event) => {
            const nextReps = Number.parseInt(event.target.value, 10) || 0;

            setLogs.forEach((_, setIndex) => {
              form.setValue(`exercises.${exerciseIndex}.setLogs.${setIndex}.reps`, nextReps, {
                shouldDirty: true,
              });
            });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`quick-done-${exerciseIndex}`}>All sets</Label>
        <Checkbox
          id={`quick-done-${exerciseIndex}`}
          checked={allSetsCompleted}
          onCheckedChange={(checked) => {
            setLogs.forEach((_, setIndex) => {
              form.setValue(
                `exercises.${exerciseIndex}.setLogs.${setIndex}.completed`,
                checked === true,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                },
              );
            });
          }}
          className={allSetsCompleted ? "shadow-[0_0_0_4px_rgba(34,197,94,0.18)]" : ""}
        />
      </div>
    </div>
  );
}
