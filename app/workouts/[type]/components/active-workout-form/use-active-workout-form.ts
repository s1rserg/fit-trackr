"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  activeWorkoutSubmissionSchema,
  type ActiveWorkoutSubmission,
} from "@/features/workouts/schemas";
import { saveWorkoutSession } from "@/features/workouts/server/actions";
import type { ActiveWorkoutData } from "@/features/workouts/types";

import {
  clearActiveWorkoutDraft,
  readActiveWorkoutDraft,
  writeActiveWorkoutDraft,
} from "./storage";

export function useActiveWorkoutForm(workout: ActiveWorkoutData) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expandedExercises, setExpandedExercises] = useState<Record<number, boolean>>({});
  const draftRestoredRef = useRef(false);

  const form = useForm<ActiveWorkoutSubmission>({
    resolver: zodResolver(activeWorkoutSubmissionSchema),
    defaultValues: {
      type: workout.type,
      exercises: workout.exercises.map((exercise) => ({
        name: exercise.name,
        description: exercise.description,
        progressMetric: exercise.progressMetric,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        orderIndex: exercise.orderIndex,
        setLogs: exercise.setLogs.map((setLog) => ({
          setIndex: setLog.setIndex,
          weight: setLog.weight,
          reps: setLog.reps,
          completed: false,
        })),
      })),
    },
  });

  useEffect(() => {
    if (draftRestoredRef.current) {
      return;
    }

    draftRestoredRef.current = true;

    const rawDraft = readActiveWorkoutDraft(workout.type);

    if (!rawDraft) {
      return;
    }

    try {
      const parsedDraft = activeWorkoutSubmissionSchema.safeParse(JSON.parse(rawDraft));

      if (parsedDraft.success && parsedDraft.data.type === workout.type) {
        form.reset(parsedDraft.data);
      }
    } catch {
      clearActiveWorkoutDraft(workout.type);
    }
  }, [form, workout.type]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const parsedDraft = activeWorkoutSubmissionSchema.safeParse(values);

      if (!parsedDraft.success) {
        return;
      }

      writeActiveWorkoutDraft(workout.type, parsedDraft.data);
    });

    return () => subscription.unsubscribe();
  }, [form, workout.type]);

  const onSubmit = form.handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      const result = await saveWorkoutSession(values);

      if (!result.success) {
        setError(result.error);
        return;
      }

      clearActiveWorkoutDraft(workout.type);

      try {
        router.push("/history");
        router.refresh();
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to save workout.",
        );
      }
    });
  });

  const toggleExerciseDetails = (exerciseIndex: number) => {
    setExpandedExercises((current) => ({
      ...current,
      [exerciseIndex]: !current[exerciseIndex],
    }));
  };

  const handleCancelWorkout = () => {
    clearActiveWorkoutDraft(workout.type);
    router.push("/");
  };

  return {
    error,
    expandedExercises,
    form,
    handleCancelWorkout,
    isPending,
    onSubmit,
    toggleExerciseDetails,
  };
}
