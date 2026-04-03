import type { ProgressMetric } from "./config";

export function getDefaultRepsValue(reps: string) {
  const firstChunk = reps.split("-")[0]?.trim() ?? "0";
  const parsed = Number.parseInt(firstChunk, 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function summarizeCompletedSets(
  setLogs: { weight: number; reps: number; completed: boolean }[],
  progressMetric: ProgressMetric,
) {
  const completedSets = setLogs.filter((setLog) => setLog.completed);

  if (completedSets.length === 0) {
    return {
      value: 0,
      weight: 0,
      reps: 0,
    };
  }

  const workingWeight = Math.min(...completedSets.map((setLog) => setLog.weight));
  const workingReps = Math.min(...completedSets.map((setLog) => setLog.reps));

  return {
    value: progressMetric === "reps" ? workingReps : workingWeight,
    weight: workingWeight,
    reps: workingReps,
  };
}
