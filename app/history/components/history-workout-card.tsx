import { Calendar, FileText } from "lucide-react";

import { ParsedChipsPreview } from "@/app/workouts/[type]/components/active-workout-form/components/parsed-chips-preview";
import { WORKOUT_METADATA, type WorkoutType } from "@/features/workouts/constants";
import { parseShorthandInput } from "@/features/workouts/parser";
import type { getWorkoutHistory } from "@/features/workouts/server/queries";

interface HistoryWorkoutCardProps {
  workout: Awaited<ReturnType<typeof getWorkoutHistory>>[number];
  sessionNumber: number;
  formattedDate: string;
}

export function HistoryWorkoutCard({
  workout,
  sessionNumber,
  formattedDate,
}: HistoryWorkoutCardProps) {
  const meta = WORKOUT_METADATA[workout.type as WorkoutType] ?? {
    title: `Workout ${workout.type}`,
    subtitle: "",
  };

  return (
    <div className="athletic-card rounded-2xl p-4 space-y-3.5">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Session #{sessionNumber}
            </span>
            <span className="text-xs font-semibold text-zinc-300">
              {meta.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono pt-0.5">
            <Calendar className="h-3 w-3 text-zinc-500" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
          {workout.performedExercises.length} exercises
        </span>
      </div>

      {/* Exercises List with Permanent Notes */}
      <div className="space-y-2.5">
        {workout.performedExercises.map((performedExercise) => {
          const parsedNote = performedExercise.note
            ? parseShorthandInput(performedExercise.note, performedExercise.weight)
            : null;

          return (
            <div
              key={`${workout.id}-${performedExercise.id}`}
              className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-2.5 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-xs text-zinc-100">
                  {performedExercise.exercise.name}
                </p>
                <div className="text-right font-mono flex items-center gap-2 text-xs">
                  <span className="font-bold text-white">
                    {performedExercise.weight} kg
                  </span>
                  <span className="text-zinc-400">
                    × {performedExercise.reps} reps
                  </span>
                </div>
              </div>

              {/* Permanent Exercise Note & Parsed Chips */}
              {performedExercise.note ? (
                <div className="rounded-lg bg-zinc-950/70 border border-zinc-800/80 p-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
                    <FileText className="h-3 w-3 text-zinc-500 flex-shrink-0" />
                    <span>{performedExercise.note}</span>
                  </div>
                  {parsedNote && parsedNote.chips.length > 0 && (
                    <ParsedChipsPreview chips={parsedNote.chips} />
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
