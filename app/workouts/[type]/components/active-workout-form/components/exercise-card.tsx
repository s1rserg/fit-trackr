"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
};

export function ExerciseCard({
  exercise,
  exerciseIndex,
  form,
  isExpanded,
  onToggleDetails,
}: ExerciseCardProps) {
  const setLogs = form.watch(`exercises.${exerciseIndex}.setLogs`);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{exercise.name}</h2>
            <p className="text-sm text-muted-foreground">
              {exercise.targetSets} sets x {exercise.targetReps} reps
            </p>
            {exercise.description ? (
              <p className="text-sm text-muted-foreground/90">{exercise.description}</p>
            ) : null}
          </div>
          {exercise.previousWorkoutDate ? (
            <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              Last session
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <QuickSetControls exerciseIndex={exerciseIndex} form={form} setLogs={setLogs} />

          <Button
            type="button"
            variant="secondary"
            className="w-full justify-between"
            onClick={onToggleDetails}
          >
            <span>Adjust sets individually</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {isExpanded ? (
            <div className="space-y-3">
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
