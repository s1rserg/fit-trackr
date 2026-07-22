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
  onSetCompleted?: () => void;
};

export function QuickSetControls({
  exerciseIndex,
  form,
  setLogs,
  onSetCompleted,
}: QuickSetControlsProps) {
  const allSetsCompleted = setLogs.every((setLog) => setLog.completed);
  const quickWeight = setLogs[0]?.weight ?? 0;
  const quickReps = setLogs[0]?.reps ?? 0;

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
      <div className="space-y-1.5">
        <Label htmlFor={`quick-weight-${exerciseIndex}`} className="text-xs text-purple-300">
          Weight for all (kg)
        </Label>
        <Input
          id={`quick-weight-${exerciseIndex}`}
          type="number"
          step="any"
          min={0}
          value={quickWeight}
          onChange={(event) => {
            const nextWeight = Number.parseFloat(event.target.value) || 0;

            setLogs.forEach((_, setIndex) => {
              form.setValue(`exercises.${exerciseIndex}.setLogs.${setIndex}.weight`, nextWeight, {
                shouldDirty: true,
              });
            });
          }}
          className="bg-secondary/40 border-purple-500/20 text-white font-mono text-base focus-visible:ring-purple-500"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`quick-reps-${exerciseIndex}`} className="text-xs text-purple-300">
          Reps for all
        </Label>
        <Input
          id={`quick-reps-${exerciseIndex}`}
          type="number"
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
          className="bg-secondary/40 border-purple-500/20 text-white font-mono text-base focus-visible:ring-purple-500"
        />
      </div>

      <div className="space-y-1.5 flex flex-col items-center">
        <Label htmlFor={`quick-done-${exerciseIndex}`} className="text-xs text-purple-300">
          All done
        </Label>
        <div className="h-10 flex items-center justify-center">
          <Checkbox
            id={`quick-done-${exerciseIndex}`}
            checked={allSetsCompleted}
            onCheckedChange={(checked) => {
              const isChecking = checked === true;
              setLogs.forEach((_, setIndex) => {
                form.setValue(
                  `exercises.${exerciseIndex}.setLogs.${setIndex}.completed`,
                  isChecking,
                  {
                    shouldDirty: true,
                    shouldTouch: true,
                  },
                );
              });
              if (isChecking && onSetCompleted) {
                onSetCompleted();
              }
            }}
            className="w-6 h-6 border-purple-500/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 emerald-glow transition-all"
          />
        </div>
      </div>
    </div>
  );
}
