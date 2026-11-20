"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  ChartNoAxesCombined,
  Dumbbell,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  readCompletedWorkout,
  rememberCompletedWorkout,
  type CompletedWorkoutSummary,
} from "@/features/workouts/completed-workout-storage";
import {
  ROUTES,
  WORKOUT_METADATA,
  WORKOUT_TYPES,
  type WorkoutType,
} from "@/features/workouts/constants";
import { cn } from "@/lib/utils";

import { formatShortDateTime } from "./utils/format-date";

function getNextWorkoutType(lastWorkoutType?: WorkoutType): WorkoutType {
  if (lastWorkoutType === WORKOUT_TYPES.A) return WORKOUT_TYPES.B;
  if (lastWorkoutType === WORKOUT_TYPES.B) return WORKOUT_TYPES.C;
  return WORKOUT_TYPES.A;
}

export function WorkoutDashboard({
  serverWorkout,
  serverWorkoutDateLabel,
  totalSessionsCount,
}: {
  serverWorkout: CompletedWorkoutSummary | null;
  serverWorkoutDateLabel: string | null;
  totalSessionsCount: number;
}) {
  const [cachedWorkout, setCachedWorkout] = useState<CompletedWorkoutSummary | null>(null);

  useEffect(() => {
    const update = () => setCachedWorkout(readCompletedWorkout());
    if (serverWorkout) rememberCompletedWorkout(serverWorkout);
    update();
    window.addEventListener("pageshow", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("pageshow", update);
      window.removeEventListener("storage", update);
    };
  }, [serverWorkout]);

  const newerCachedWorkout = cachedWorkout &&
    (!serverWorkout || Date.parse(cachedWorkout.dateCompleted) > Date.parse(serverWorkout.dateCompleted))
      ? cachedWorkout
      : null;
  const lastWorkout = newerCachedWorkout ?? serverWorkout;
  const nextWorkoutType = getNextWorkoutType(lastWorkout?.type);
  const lastWorkoutDateLabel = newerCachedWorkout
    ? formatShortDateTime(newerCachedWorkout.dateCompleted)
    : serverWorkoutDateLabel;

  return (
    <main className="flex flex-1 flex-col gap-5 max-w-2xl mx-auto w-full pb-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-5 athletic-card shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Dumbbell className="h-3 w-3" /> Fit Trackr
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {totalSessionsCount} Sessions Logged
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Workout Dashboard
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Full Body A / B / C split. Progressive overload and volume tracking.
        </p>

        {/* Last Completed Banner */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                Last Completed
              </p>
              {lastWorkout ? (
                <p className="text-xs font-semibold text-zinc-200">
                  Workout {lastWorkout.type} • {lastWorkoutDateLabel}
                </p>
              ) : (
                <p className="text-xs text-zinc-500">No completed workouts yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Routine Selection Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
            Select Routine
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">3 Routines</span>
        </div>

        {(Object.values(WORKOUT_TYPES) as readonly WorkoutType[]).map((type) => {
          const isNext = nextWorkoutType === type;
          const meta = WORKOUT_METADATA[type];

          return (
            <a key={type} href={ROUTES.WORKOUT(type)} className="block group">
              <div
                className={cn(
                  "relative rounded-2xl p-4 athletic-card-interactive border transition-all",
                  isNext
                    ? "border-zinc-500/70 bg-zinc-900/90"
                    : "border-zinc-800 bg-zinc-900/40",
                )}
              >
                {isNext && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] uppercase font-mono font-bold bg-white text-zinc-950">
                    Next Up
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-base",
                        isNext
                          ? "bg-white text-zinc-950 shadow-sm"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700",
                      )}
                    >
                      {type}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                        {meta.title}
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium">
                        {meta.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 rounded-xl border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white text-zinc-300 font-medium text-xs"
        >
          <Link href={ROUTES.HISTORY}>
            <History className="mr-2 h-4 w-4 text-zinc-400" />
            Workout History
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 rounded-xl border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white text-zinc-300 font-medium text-xs"
        >
          <Link href={ROUTES.PROGRESS}>
            <ChartNoAxesCombined className="mr-2 h-4 w-4 text-zinc-400" />
            Exercise Progress
          </Link>
        </Button>
      </div>
    </main>
  );
}
