"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, History, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getExerciseRecentHistory,
  type ExerciseRecentHistoryItem,
} from "@/features/exercises/server/get-exercise-recent-history";
import { parseShorthandInput } from "@/features/workouts/parser";

import { ParsedChipsPreview } from "./parsed-chips-preview";

interface ExerciseHistorySheetProps {
  exerciseId: number;
  exerciseName: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ExerciseHistorySheet({
  exerciseId,
  exerciseName,
  isOpen,
  onClose,
}: ExerciseHistorySheetProps) {
  const [history, setHistory] = useState<ExerciseRecentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch history when opened
  useEffect(() => {
    if (!isOpen || !exerciseId) return;

    let isMounted = true;
    setIsLoading(true);

    getExerciseRecentHistory(exerciseId, 5).then((data) => {
      if (isMounted) {
        setHistory(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, exerciseId]);

  // Lock background body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <History className="h-4 w-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{exerciseName}</h3>
              <p className="text-[11px] text-zinc-400">Recent Session History (Last 5)</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 p-0 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white"
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-xs">Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500">
              No previous sessions recorded for this exercise yet.
            </div>
          ) : (
            history.map((item, idx) => {
              const parsedNote = item.note ? parseShorthandInput(item.note, item.weight) : null;

              return (
                <div
                  key={`${item.workoutId}-${idx}`}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      <span>{formatDate(item.dateCompleted)}</span>
                      <span className="text-zinc-600">• Workout {item.workoutType}</span>
                    </div>

                    <div className="font-mono text-xs">
                      <strong className="text-white">{item.weight} kg</strong>
                      <span className="text-zinc-400 ml-1">× {item.reps}</span>
                    </div>
                  </div>

                  {item.note && (
                    <div className="rounded-lg bg-zinc-950 border border-zinc-800/60 p-2 space-y-1">
                      <p className="text-[11px] font-mono text-zinc-300">{item.note}</p>
                      {parsedNote && parsedNote.chips.length > 0 && (
                        <ParsedChipsPreview chips={parsedNote.chips} />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
