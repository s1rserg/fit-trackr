import Link from "next/link";
import { ArrowLeft, ChartNoAxesCombined } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getExerciseProgress } from "@/features/workouts/server/queries";

import { ProgressSeriesCard } from "./components";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const progress = await getExerciseProgress();

  return (
    <main className="flex flex-1 flex-col gap-5 max-w-2xl mx-auto w-full pb-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-purple-300 hover:bg-purple-950/40">
          <Link href="/" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] font-semibold text-purple-400">Analytics</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ChartNoAxesCombined className="h-6 w-6 text-primary" /> Exercise Progress
          </h1>
        </div>
      </div>

      {progress.length === 0 ? (
        <Card className="glass-card border border-purple-500/20 p-6">
          <CardContent className="p-0 text-center text-sm text-purple-300/70">
            No progress data yet. Complete a few workouts to see your strength charts grow!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {progress.map((series) => (
            <ProgressSeriesCard key={series.name} series={series} />
          ))}
        </div>
      )}
    </main>
  );
}
