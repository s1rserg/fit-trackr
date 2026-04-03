import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getExerciseProgress } from "@/features/workouts/server/queries";

import { ProgressSeriesCard } from "./components";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const progress = await getExerciseProgress();

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Progress</p>
          <h1 className="text-2xl font-semibold">Exercise charts</h1>
        </div>
      </div>

      {progress.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No progress data yet. Finish a few workouts and the charts will appear here.
          </CardContent>
        </Card>
      ) : (
        progress.map((series) => <ProgressSeriesCard key={series.name} series={series} />)
      )}
    </main>
  );
}
