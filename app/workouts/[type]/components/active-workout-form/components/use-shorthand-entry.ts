"use client";

import { useCallback, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { ActiveWorkoutSubmission } from "@/features/workouts/schemas";
import type { ActiveWorkoutExercise } from "@/features/workouts/types";
import { parseShorthandInput } from "@/features/workouts/parser";

export function useShorthandEntry(
  exercise: ActiveWorkoutExercise,
  exerciseIndex: number,
  form: UseFormReturn<ActiveWorkoutSubmission>,
) {
  const currentSetLogs = form.watch(`exercises.${exerciseIndex}.setLogs`);
  const isCompleted = currentSetLogs.every((setLog) => setLog.completed);

  // Fallback baseline weight
  const fallbackWeight = useMemo(() => {
    const firstSet = currentSetLogs[0];
    return firstSet?.weight ?? 0;
  }, [currentSetLogs]);

  // Initial shorthand input from previous note if available or empty
  const [rawText, setRawText] = useState("");

  const parsed = useMemo(() => {
    return parseShorthandInput(rawText, fallbackWeight, exercise.targetSets);
  }, [rawText, fallbackWeight, exercise.targetSets]);

  const parsedPrevious = useMemo(() => {
    if (!exercise.note) return null;
    return parseShorthandInput(exercise.note, fallbackWeight, exercise.targetSets);
  }, [exercise.note, fallbackWeight, exercise.targetSets]);

  const handleTextChange = useCallback(
    (newText: string) => {
      setRawText(newText);

      // Save raw text as note
      form.setValue(`exercises.${exerciseIndex}.note`, newText, {
        shouldDirty: true,
      });

      const nextParsed = parseShorthandInput(newText, fallbackWeight, exercise.targetSets);

      if (nextParsed.sets.length > 0) {
        // Map parsed sets to form setLogs
        const formattedSets = nextParsed.sets.map((set) => ({
          setIndex: set.setIndex,
          weight: set.weight,
          reps: set.reps,
          completed: true,
        }));

        form.setValue(`exercises.${exerciseIndex}.setLogs`, formattedSets, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    },
    [exerciseIndex, fallbackWeight, exercise.targetSets, form],
  );

  const handleToggleComplete = useCallback(
    (checked: boolean) => {
      currentSetLogs.forEach((_, setIdx) => {
        form.setValue(`exercises.${exerciseIndex}.setLogs.${setIdx}.completed`, checked, {
          shouldDirty: true,
          shouldTouch: true,
        });
      });
    },
    [exerciseIndex, currentSetLogs, form],
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
    isCompleted,
    fallbackWeight,
    handleTextChange,
    handleToggleComplete,
    applyPreviousNote,
  };
}
