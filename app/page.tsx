import Link from "next/link";
import { CalendarDays, ChevronRight, ChartNoAxesCombined, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLastWorkoutSummary } from "@/features/workouts/server/queries";

import { formatShortDateTime } from "./utils/format-date";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const lastWorkout = await getLastWorkoutSummary();

  return (
    <main className="flex flex-1 flex-col gap-5">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/20 via-card to-card">
          <p className="text-sm uppercase tracking-[0.28em] text-primary">Fit Trackr</p>
          <CardTitle className="text-3xl">A/B workout tracker</CardTitle>
          <CardDescription>
            Open the next session fast, keep the previous weight visible, and finish with one tap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Last completed workout
            </div>
            {lastWorkout ? (
              <div>
                <p className="text-xl font-semibold">Workout {lastWorkout.type}</p>
                <p className="text-sm text-muted-foreground">
                  {formatShortDateTime(lastWorkout.dateCompleted)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No completed workouts yet. Seed the templates or start your first session.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        <Button asChild size="lg" className="h-16 justify-between rounded-3xl px-5 text-left">
          <Link href="/workouts/A">
            <span>
              <span className="block text-xs uppercase tracking-[0.24em] opacity-70">Start</span>
              <span className="block text-lg">Workout A</span>
            </span>
            <ChevronRight className="h-6 w-6" />
          </Link>
        </Button>

        <Button
          asChild
          variant="secondary"
          size="lg"
          className="h-16 justify-between rounded-3xl px-5 text-left"
        >
          <Link href="/workouts/B">
            <span>
              <span className="block text-xs uppercase tracking-[0.24em] opacity-70">Start</span>
              <span className="block text-lg">Workout B</span>
            </span>
            <ChevronRight className="h-6 w-6" />
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="h-14 rounded-3xl">
          <Link href="/history">
            <History className="mr-2 h-5 w-5" />
            View history
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="h-14 rounded-3xl">
          <Link href="/progress">
            <ChartNoAxesCombined className="mr-2 h-5 w-5" />
            View progress
          </Link>
        </Button>
      </div>
    </main>
  );
}
