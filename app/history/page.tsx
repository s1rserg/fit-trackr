import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWorkoutHistory } from "@/features/workouts/server/queries";

import { HistoryWorkoutCard } from "./components";
import { formatWorkoutDateTime } from "../utils/format-date";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const history = await getWorkoutHistory();

  return (
    <main className="flex flex-1 flex-col gap-5 max-w-2xl mx-auto w-full pb-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-purple-300 hover:bg-purple-950/40">
          <Link href="/" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] font-semibold text-purple-400">Logbook</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <History className="h-6 w-6 text-primary" /> Past Workouts
          </h1>
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="glass-card border border-purple-500/20 p-6">
          <CardContent className="p-0 text-center text-sm text-purple-300/70">
            No workouts logged yet. Start a session from the home screen!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((workout: typeof history[number]) => (
            <HistoryWorkoutCard
              key={workout.id}
              workout={workout}
              formatWorkoutDate={formatWorkoutDateTime}
            />
          ))}
        </div>
      )}
    </main>
  );
}
