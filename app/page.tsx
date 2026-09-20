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
  ROUTES,
  SESSION_OFFSET,
  WORKOUT_METADATA,
  WORKOUT_TYPES,
  type WorkoutType,
} from "@/features/workouts/constants";
import { getLastWorkoutSummary, getWorkoutHistory } from "@/features/workouts/server/queries";
import { cn } from "@/lib/utils";

import { formatShortDateTime } from "./utils/format-date";

export const dynamic = "force-dynamic";

function getNextWorkoutType(lastWorkoutType?: WorkoutType): WorkoutType {
  if (lastWorkoutType === WORKOUT_TYPES.A) return WORKOUT_TYPES.B;
  if (lastWorkoutType === WORKOUT_TYPES.B) return WORKOUT_TYPES.C;
  return WORKOUT_TYPES.A;
}

export default async function HomePage() {
  const lastWorkout = await getLastWorkoutSummary();
  const history = await getWorkoutHistory();

  const nextWorkoutType = getNextWorkoutType(lastWorkout?.type as WorkoutType | undefined);
  const totalSessionsCount = history.length + SESSION_OFFSET;

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
                  Workout {lastWorkout.type} • {formatShortDateTime(lastWorkout.dateCompleted)}
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
            <Link key={type} href={ROUTES.WORKOUT(type)} className="block group">
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
            </Link>
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
