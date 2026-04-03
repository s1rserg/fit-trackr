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
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-secondary/20 p-3">
      <div className="col-span-2 text-sm font-medium text-muted-foreground">
        Set {setLog.setIndex}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`}>Weight</Label>
        <Input
          id={`weight-${exerciseIndex}-${setIndex}`}
          type="number"
          inputMode="numeric"
          min={0}
          {...form.register(`exercises.${exerciseIndex}.setLogs.${setIndex}.weight`, {
            valueAsNumber: true,
          })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`}>Reps</Label>
        <Input
          id={`reps-${exerciseIndex}-${setIndex}`}
          type="number"
          inputMode="numeric"
          min={0}
          {...form.register(`exercises.${exerciseIndex}.setLogs.${setIndex}.reps`, {
            valueAsNumber: true,
          })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`done-${exerciseIndex}-${setIndex}`}>Done</Label>
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
          className={completed ? "shadow-[0_0_0_4px_rgba(34,197,94,0.18)]" : ""}
        />
      </div>
    </div>
  );
}
