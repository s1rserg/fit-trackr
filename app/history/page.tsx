import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWorkoutHistory } from "@/features/workouts/server/queries";

import { HistoryWorkoutCard } from "./components";
import { formatWorkoutDateTime } from "../utils/format-date";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const history = await getWorkoutHistory();

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">History</p>
          <h1 className="text-2xl font-semibold">Past workouts</h1>
        </div>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No workouts logged yet.
          </CardContent>
        </Card>
      ) : (
        history.map((workout) => (
          <HistoryWorkoutCard
            key={workout.id}
            workout={workout}
            formatWorkoutDate={formatWorkoutDateTime}
          />
        ))
      )}
    </main>
  );
}
