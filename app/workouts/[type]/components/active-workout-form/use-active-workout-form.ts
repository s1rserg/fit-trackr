"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  activeWorkoutSubmissionSchema,
  type ActiveWorkoutSubmission,
} from "@/features/workouts/schemas";
import { saveWorkoutSession } from "@/features/workouts/server/actions";
import type { ActiveWorkoutData } from "@/features/workouts/types";

export function useActiveWorkoutForm(workout: ActiveWorkoutData) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expandedExercises, setExpandedExercises] = useState<Record<number, boolean>>({});

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

  const onSubmit = form.handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      const result = await saveWorkoutSession(values);

      if (!result.success) {
        setError(result.error);
        return;
      }

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

  return {
    error,
    expandedExercises,
    form,
    isPending,
    onSubmit,
    toggleExerciseDetails,
  };
}
