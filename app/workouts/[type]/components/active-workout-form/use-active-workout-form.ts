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
import { ROUTES } from "@/features/workouts/constants";

import {
  clearActiveWorkoutDraft,
  readActiveWorkoutDraft,
  writeActiveWorkoutDraft,
} from "./storage";

export function useActiveWorkoutForm(workout: ActiveWorkoutData) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const draftRestoredRef = useRef(false);

  const form = useForm<ActiveWorkoutSubmission>({
    resolver: zodResolver(activeWorkoutSubmissionSchema),
    defaultValues: {
      type: workout.type,
      exercises: workout.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        description: exercise.description,
        note: "",
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

  // Restore saved draft on mount
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
      const parsedDraft = JSON.parse(rawDraft);
      if (parsedDraft && parsedDraft.type === workout.type) {
        form.reset(parsedDraft);
      }
    } catch {
      clearActiveWorkoutDraft(workout.type);
    }
  }, [form, workout.type]);

  // Save changes to localStorage on input and on leaving/unmount
  useEffect(() => {
    const saveDraft = () => {
      const currentValues = form.getValues();
      if (currentValues?.type === workout.type) {
        writeActiveWorkoutDraft(workout.type, currentValues);
      }
    };

    let timeoutId: NodeJS.Timeout | null = null;
    const subscription = form.watch(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(saveDraft, 300);
    });

    window.addEventListener("pagehide", saveDraft);
    window.addEventListener("visibilitychange", saveDraft);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
      window.removeEventListener("pagehide", saveDraft);
      window.removeEventListener("visibilitychange", saveDraft);
      saveDraft();
    };
  }, [form, workout.type]);

  const onSubmit = form.handleSubmit((values) => {
    const totalExercises = values.exercises.length;
    const completedCount = values.exercises.filter((ex) => {
      const targetSets = ex.targetSets || 3;
      const completedSets = ex.setLogs ? ex.setLogs.filter((s) => s.completed && s.reps > 0) : [];
      return completedSets.length >= targetSets;
    }).length;

    if (completedCount < totalExercises) {
      const confirmed = window.confirm(
        `You've only completed ${completedCount} of ${totalExercises} exercises. Are you sure you want to finish? Did you forget any exercises?`,
      );
      if (!confirmed) {
        return;
      }
    }

    setError(null);

    startTransition(async () => {
      const result = await saveWorkoutSession(values);

      if (!result.success) {
        setError(result.error);
        return;
      }

      clearActiveWorkoutDraft(workout.type);

      try {
        router.push(ROUTES.HISTORY);
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

  // Tapping the X button leaves the workout and saves your progress (does not delete it)
  const handleCancelWorkout = () => {
    const currentValues = form.getValues();
    if (currentValues?.type === workout.type) {
      writeActiveWorkoutDraft(workout.type, currentValues);
    }
    router.push(ROUTES.HOME);
  };

  return {
    error,
    form,
    handleCancelWorkout,
    isPending,
    onSubmit,
  };
}
