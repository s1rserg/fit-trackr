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
  const draftClosedRef = useRef(false);

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
          weight: 0,
          reps: 0,
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
    let timeoutId: NodeJS.Timeout | null = null;

    const subscription = form.watch((values) => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (draftClosedRef.current) return;
        const parsedDraft = activeWorkoutSubmissionSchema.safeParse(values);

        if (!parsedDraft.success) {
          return;
        }

        writeActiveWorkoutDraft(workout.type, parsedDraft.data);
      }, 1000);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [form, workout.type]);

  const onSubmit = form.handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      writeActiveWorkoutDraft(workout.type, values);
      if (!navigator.onLine) {
        setError("You are offline. Your workout is saved on this device; reconnect and tap Finish Workout again.");
        return;
      }
      let result: Awaited<ReturnType<typeof saveWorkoutSession>>;
      try {
        result = await saveWorkoutSession(values);
      } catch {
        setError("Could not reach the server. Your workout is saved on this device; reconnect and try again.");
        return;
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      draftClosedRef.current = true;
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

  const handleCancelWorkout = () => {
    draftClosedRef.current = true;
    clearActiveWorkoutDraft(workout.type);
    window.location.href = ROUTES.HOME;
  };

  return {
    error,
    form,
    handleCancelWorkout,
    isPending,
    onSubmit,
  };
}
