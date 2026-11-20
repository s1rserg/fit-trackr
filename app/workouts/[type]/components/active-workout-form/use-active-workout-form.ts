"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  activeWorkoutSubmissionSchema,
  type ActiveWorkoutSubmission,
} from "@/features/workouts/schemas";
import { saveWorkoutSession } from "@/features/workouts/server/actions";
import type { ActiveWorkoutData } from "@/features/workouts/types";
import { rememberCompletedWorkout } from "@/features/workouts/completed-workout-storage";
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

  const emptySession: ActiveWorkoutSubmission = {
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
  };
  const emptyDraft = JSON.stringify(emptySession);
  const form = useForm<ActiveWorkoutSubmission>({
    resolver: zodResolver(activeWorkoutSubmissionSchema),
    defaultValues: emptySession,
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

  const saveDraft = useCallback(() => {
    if (draftClosedRef.current) return;

    const currentValues = form.getValues();
    if (currentValues.type !== workout.type) return;

    if (JSON.stringify(currentValues) === emptyDraft) {
      clearActiveWorkoutDraft(workout.type);
    } else {
      writeActiveWorkoutDraft(workout.type, currentValues);
    }
  }, [emptyDraft, form, workout.type]);

  // Save changes to localStorage on input and on leaving/unmount
  useEffect(() => {
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
  }, [form, saveDraft]);

  const handleClearSession = () => {
    if (isPending || draftClosedRef.current) return;
    form.reset(emptySession);
    clearActiveWorkoutDraft(workout.type);
    setError(null);
  };

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
      rememberCompletedWorkout(result.workout);
      navigator.serviceWorker?.controller?.postMessage({ type: "CACHE_WORKOUTS" });

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
    saveDraft();
    window.location.href = ROUTES.HOME;
  };

  return {
    error,
    form,
    handleCancelWorkout,
    handleClearSession,
    isPending,
    onSubmit,
  };
}
