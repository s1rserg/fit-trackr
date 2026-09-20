"use client";

import { useCallback, useRef, useState } from "react";

import { updateExerciseDescription } from "@/features/exercises/server/update-exercise-description";

const DOUBLE_TAP_THRESHOLD_MS = 350;

export function useExerciseDescription(exerciseId: number, initialDescription: string) {
  const [description, setDescription] = useState(initialDescription);
  const [draft, setDraft] = useState(initialDescription);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastTapRef = useRef<number>(0);

  const startEditing = useCallback(() => {
    setDraft(description);
    setError(null);
    setIsEditing(true);
  }, [description]);

  const cancelEditing = useCallback(() => {
    setDraft(description);
    setIsEditing(false);
    setError(null);
  }, [description]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    const result = await updateExerciseDescription(exerciseId, draft);

    setIsSaving(false);
    if (result.success) {
      setDescription(draft.trim());
      setIsEditing(false);
    } else {
      setError(result.error ?? "Failed to save description.");
    }
  }, [exerciseId, draft]);

  // Supports both standard desktop double-click and mobile touch double-tap
  const handleTouchEnd = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastTapRef.current;

    if (elapsed > 0 && elapsed < DOUBLE_TAP_THRESHOLD_MS) {
      startEditing();
    }

    lastTapRef.current = now;
  }, [startEditing]);

  return {
    description,
    draft,
    setDraft,
    isEditing,
    isSaving,
    error,
    startEditing,
    cancelEditing,
    handleSave,
    handleTouchEnd,
  };
}
