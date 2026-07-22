import Link from "next/link";
import { CalendarDays, ChevronRight, ChartNoAxesCombined, History, Dumbbell, Sparkles, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { workoutMeta, type WorkoutType } from "@/features/workouts/config";
import { getLastWorkoutSummary } from "@/features/workouts/server/queries";
import { getWorkoutHistory } from "@/features/workouts/server/queries";
import { cn } from "@/lib/utils";

import { formatShortDateTime } from "./utils/format-date";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const lastWorkout = await getLastWorkoutSummary();
  const history = await getWorkoutHistory();

  // Smart next workout logic in sequence A -> B -> C -> A
  let nextWorkoutType: WorkoutType = "A";
  if (lastWorkout?.type === "A") nextWorkoutType = "B";
  else if (lastWorkout?.type === "B") nextWorkoutType = "C";
  else if (lastWorkout?.type === "C") nextWorkoutType = "A";

  const totalWorkoutsCount = history.length;

  return (
    <main className="flex flex-1 flex-col gap-6 max-w-2xl mx-auto w-full pb-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 glass-card purple-glow border border-primary/30">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/20 text-purple-300 border border-primary/30">
              <Dumbbell className="h-3.5 w-3.5" /> Fit Trackr • Full Body 3x
            </span>
            {totalWorkoutsCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Flame className="h-3.5 w-3.5" /> {totalWorkoutsCount} Sessions Logged
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            Workout Dashboard
          </h1>
          <p className="text-sm text-purple-200/70 mt-1 max-w-md">
            Full Body A / B / C split. Track progressive overload, rest intervals, and volume seamlessly.
          </p>

          {/* Last Completed Banner */}
          <div className="mt-5 pt-4 border-t border-purple-500/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/20 text-purple-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Last Session</p>
                {lastWorkout ? (
                  <p className="text-sm font-semibold text-purple-100">
                    Workout {lastWorkout.type} • {formatShortDateTime(lastWorkout.dateCompleted)}
                  </p>
                ) : (
                  <p className="text-xs text-purple-300/60">No completed workouts yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Selection Cards (A, B, C) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-purple-300/80 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Select Workout Routine
          </h2>
          <span className="text-xs text-muted-foreground">3 Routines Active</span>
        </div>

        {(["A", "B", "C"] as const).map((type) => {
          const isNext = nextWorkoutType === type;
          const meta = workoutMeta[type];

          return (
            <Link key={type} href={`/workouts/${type}`} className="block group">
              <div
                className={cn(
                  "relative overflow-hidden rounded-3xl p-5 glass-card-interactive border transition-all",
                  isNext
                    ? "border-primary/50 bg-gradient-to-r from-purple-950/70 via-purple-900/30 to-purple-950/50 purple-glow-sm"
                    : "border-purple-500/15 bg-card/40 hover:border-purple-500/30",
                )}
              >
                {isNext && (
                  <span className="absolute top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-primary text-white shadow-md">
                    Recommended Next
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105",
                        isNext
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-purple-950/80 text-purple-300 border border-purple-500/20",
                      )}
                    >
                      {type}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {meta.title}
                      </h3>
                      <p className="text-xs text-purple-300/70 font-medium">
                        {meta.subtitle} • 7 Exercises
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                      Start Workout
                    </span>
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isNext
                          ? "bg-primary/20 text-purple-300 group-hover:bg-primary group-hover:text-white"
                          : "bg-secondary/40 text-muted-foreground group-hover:text-white",
                      )}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-14 rounded-2xl border-purple-500/20 bg-secondary/30 hover:bg-purple-950/40 text-purple-200 font-medium"
        >
          <Link href="/history">
            <History className="mr-2 h-4 w-4 text-purple-400" />
            Workout History
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-14 rounded-2xl border-purple-500/20 bg-secondary/30 hover:bg-purple-950/40 text-purple-200 font-medium"
        >
          <Link href="/progress">
            <ChartNoAxesCombined className="mr-2 h-4 w-4 text-purple-400" />
            Exercise Progress
          </Link>
        </Button>
      </div>
    </main>
  );
}
