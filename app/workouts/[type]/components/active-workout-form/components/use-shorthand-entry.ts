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
  const targetSets = exercise.targetSets || 3;

  // Exercise is only completed if target number of sets (>=3) have been completed
  const completedSetsCount = useMemo(() => {
    return currentSetLogs.filter((setLog) => setLog.completed).length;
  }, [currentSetLogs]);

  const isCompleted = useMemo(() => {
    return (
      currentSetLogs.length >= targetSets &&
      currentSetLogs.every((setLog) => setLog.completed)
    );
  }, [currentSetLogs, targetSets]);

  // Fallback baseline weight
  const fallbackWeight = useMemo(() => {
    const firstSet = currentSetLogs[0];
    return firstSet?.weight ?? 0;
  }, [currentSetLogs]);

  const [rawText, setRawText] = useState("");

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
        const reachedTarget = parsedCount >= targetSets;

        // Populate sets: if user entered 1 or 2 sets, pad remaining sets up to targetSets
        const formattedSets = Array.from({ length: Math.max(parsedCount, targetSets) }, (_, idx) => {
          const setIndex = idx + 1;
          const parsedSet = nextParsed.sets[idx];

          if (parsedSet) {
            return {
              setIndex,
              weight: parsedSet.weight,
              reps: parsedSet.reps,
              completed: reachedTarget,
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
      }
    },
    [exerciseIndex, fallbackWeight, targetSets, form],
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
