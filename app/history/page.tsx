import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES, SESSION_OFFSET } from "@/features/workouts/constants";
import { getWorkoutHistory } from "@/features/workouts/server/queries";

import { HistoryWorkoutCard } from "./components";
import { formatWorkoutDateTime } from "../utils/format-date";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const history = await getWorkoutHistory();
  const totalRecordedCount = history.length;

  return (
    <main className="flex flex-1 flex-col gap-4 max-w-2xl mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Link href={ROUTES.HOME} aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
            Logbook
          </p>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="h-5 w-5 text-zinc-400" /> Past Workouts
          </h1>
        </div>
      </div>

      {totalRecordedCount === 0 ? (
        <div className="athletic-card rounded-2xl p-6 text-center text-sm text-zinc-400">
          No workouts logged yet. Start a session from the home screen!
        </div>
      ) : (
        <div className="space-y-3.5">
          {history.map((workout, index) => {
            const sessionNumber = totalRecordedCount - index + SESSION_OFFSET;
            const formattedDate = formatWorkoutDateTime(workout.dateCompleted);

            return (
              <HistoryWorkoutCard
                key={workout.id}
                workout={workout}
                sessionNumber={sessionNumber}
                formattedDate={formattedDate}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
