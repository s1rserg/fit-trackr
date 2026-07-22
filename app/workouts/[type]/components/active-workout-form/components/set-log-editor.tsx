"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";
import type { UseFormReturn } from "react-hook-form";

type SetLogEditorProps = {
  exerciseIndex: number;
  form: UseFormReturn<ActiveWorkoutSubmission>;
  setLog: ActiveWorkoutSubmission["exercises"][number]["setLogs"][number];
  setIndex: number;
};

export function SetLogEditor({
  exerciseIndex,
  form,
  setLog,
  setIndex,
}: SetLogEditorProps) {
  const completed = form.watch(`exercises.${exerciseIndex}.setLogs.${setIndex}.completed`);

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center rounded-2xl border border-purple-500/20 bg-secondary/30 p-3">
      <div className="space-y-1">
        <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`} className="text-[11px] text-purple-300">
          Set {setLog.setIndex} Weight (kg)
        </Label>
        <Input
          id={`weight-${exerciseIndex}-${setIndex}`}
          type="number"
          step="any"
          min={0}
          className="bg-secondary/40 border-purple-500/20 text-white font-mono text-sm focus-visible:ring-purple-500 h-9"
          {...form.register(`exercises.${exerciseIndex}.setLogs.${setIndex}.weight`, {
            valueAsNumber: true,
          })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`} className="text-[11px] text-purple-300">
          Reps
        </Label>
        <Input
          id={`reps-${exerciseIndex}-${setIndex}`}
          type="number"
          min={0}
          className="bg-secondary/40 border-purple-500/20 text-white font-mono text-sm focus-visible:ring-purple-500 h-9"
          {...form.register(`exercises.${exerciseIndex}.setLogs.${setIndex}.reps`, {
            valueAsNumber: true,
          })}
        />
      </div>
      <div className="space-y-1 flex flex-col items-center">
        <Label htmlFor={`done-${exerciseIndex}-${setIndex}`} className="text-[11px] text-purple-300">
          Done
        </Label>
        <div className="h-9 flex items-center justify-center">
          <Checkbox
            id={`done-${exerciseIndex}-${setIndex}`}
            checked={completed}
            onCheckedChange={(checked) =>
              form.setValue(
                `exercises.${exerciseIndex}.setLogs.${setIndex}.completed`,
                checked === true,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                },
              )
            }
            className="w-5 h-5 border-purple-500/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 emerald-glow transition-all"
          />
        </div>
      </div>
    </div>
  );
}
