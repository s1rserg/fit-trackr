"use client";

import { useCallback, useMemo, useState } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";
import type { ActiveWorkoutExercise } from "@/features/workouts/types";
import { parseShorthandInput, type ParsedSet } from "@/features/workouts/parser";

const EMPTY_LOGS: readonly any[] = [];
const EMPTY_SETS: readonly ParsedSet[] = [];

export function useShorthandEntry(
  exercise: ActiveWorkoutExercise,
  exerciseIndex: number,
  form: UseFormReturn<ActiveWorkoutSubmission>,
) {
  const currentSetLogs = useWatch({
    control: form.control,
    name: `exercises.${exerciseIndex}.setLogs`,
    defaultValue: exercise.setLogs,
  }) || EMPTY_LOGS;

  const targetSets = exercise.targetSets || 3;

  // Exercise is completed if target number of sets (>=3) have been completed with reps > 0
  const completedSetsCount = useMemo(() => {
    return currentSetLogs.filter((setLog) => setLog.completed && setLog.reps > 0).length;
  }, [currentSetLogs]);

  const isCompleted = useMemo(() => {
    return completedSetsCount >= targetSets;
  }, [completedSetsCount, targetSets]);

  // Fallback baseline weight
  const fallbackWeight = useMemo(() => {
    const firstSet = currentSetLogs[0];
    return firstSet?.weight ?? 0;
  }, [currentSetLogs]);

  const initialNote = form.getValues(`exercises.${exerciseIndex}.note`) || "";
  const [rawText, setRawText] = useState(initialNote);

  const parsed = useMemo(() => {
    return parseShorthandInput(rawText, fallbackWeight, targetSets);
  }, [rawText, fallbackWeight, targetSets]);

  const parsedPrevious = useMemo(() => {
    if (!exercise.note) return null;
    return parseShorthandInput(exercise.note, fallbackWeight, targetSets);
  }, [exercise.note, fallbackWeight, targetSets]);

  const previousWeight = useMemo(() => {
    if (parsedPrevious && parsedPrevious.sets.length > 0) {
      return Math.max(...parsedPrevious.sets.map((s) => s.weight));
    }
    return fallbackWeight;
  }, [parsedPrevious, fallbackWeight]);

  const previousReps = useMemo(() => {
    if (parsedPrevious && parsedPrevious.sets.length > 0) {
      const topSet = parsedPrevious.sets.find((s) => s.weight === previousWeight) ?? parsedPrevious.sets[0];
      return topSet.reps;
    }
    const firstSet = currentSetLogs[0];
    return firstSet?.reps ?? 0;
  }, [parsedPrevious, previousWeight, currentSetLogs]);

  const handleTextChange = useCallback(
    (newText: string) => {
      setRawText(newText);

      // Save raw text as note
      form.setValue(`exercises.${exerciseIndex}.note`, newText, {
        shouldDirty: true,
      });

      const nextParsed = parseShorthandInput(newText, fallbackWeight, targetSets);

      if (nextParsed.sets.length > 0) {
        const parsedCount = nextParsed.sets.length;

        // Populate sets: every entered set is completed; pad unreached sets with reps: 0, completed: false
        const formattedSets = Array.from({ length: Math.max(parsedCount, targetSets) }, (_, idx) => {
          const setIndex = idx + 1;
          const parsedSet = nextParsed.sets[idx];

          if (parsedSet) {
            return {
              setIndex,
              weight: parsedSet.weight,
              reps: parsedSet.reps,
              completed: true,
            };
          }

          // Unreached sets
          return {
            setIndex,
            weight: fallbackWeight,
            reps: 0,
            completed: false,
          };
        });

        form.setValue(`exercises.${exerciseIndex}.setLogs`, formattedSets, {
          shouldDirty: true,
          shouldTouch: true,
        });
      } else {
        // Reset sets to uncompleted if text was cleared
        const resetSets = Array.from({ length: targetSets }, (_, idx) => ({
          setIndex: idx + 1,
          weight: fallbackWeight,
          reps: 0,
          completed: false,
        }));

        form.setValue(`exercises.${exerciseIndex}.setLogs`, resetSets, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    },
    [exerciseIndex, fallbackWeight, targetSets, form],
  );

  const handleToggleComplete = useCallback(
    (checked: boolean) => {
      const current = form.getValues(`exercises.${exerciseIndex}.setLogs`) || [];
      const defaultReps = previousReps > 0 ? previousReps : 10;

      const updated = current.map((s) => ({
        ...s,
        completed: checked,
        reps: checked && s.reps === 0 ? defaultReps : s.reps,
      }));

      form.setValue(`exercises.${exerciseIndex}.setLogs`, updated, {
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [exerciseIndex, form, previousReps],
  );

  const applyPreviousNote = useCallback(() => {
    if (exercise.note) {
      handleTextChange(exercise.note);
    }
  }, [exercise.note, handleTextChange]);

  return {
    rawText,
    parsed,
    parsedPrevious,
    previousSets: parsedPrevious?.sets ?? EMPTY_SETS,
    previousWeight,
    previousReps,
    isCompleted,
    completedSetsCount,
    targetSets,
    fallbackWeight,
    handleTextChange,
    handleToggleComplete,
    applyPreviousNote,
  };
}
