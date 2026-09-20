"use client";

import { Check, Edit3, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useExerciseDescription } from "./use-exercise-description";

interface EditableDescriptionProps {
  exerciseId: number;
  initialDescription: string;
}

export function EditableDescription({
  exerciseId,
  initialDescription,
}: EditableDescriptionProps) {
  const {
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
  } = useExerciseDescription(exerciseId, initialDescription);

  if (isEditing) {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Enter exercise description / cue..."
          rows={2}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          autoFocus
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelEditing}
            disabled={isSaving}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 px-2.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" />}
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={startEditing}
      onTouchEnd={handleTouchEnd}
      title="Double-click to edit description"
      className="group mt-1 cursor-pointer select-none rounded-lg p-1 -ml-1 transition-colors hover:bg-zinc-900/50"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-zinc-400 leading-relaxed">
          {description || <span className="italic text-zinc-600">No description. Double-click or double-tap to add cue...</span>}
        </p>
        <Edit3 className="h-3.5 w-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      </div>
    </div>
  );
}
