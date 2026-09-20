import { SESSION_OFFSET, type ProgressMetric } from "./constants";

export { SESSION_OFFSET };

export function getDefaultRepsValue(reps: string): number {
  const firstChunk = reps.split(/[-–]/)[0]?.trim() ?? "0";
  const parsed = Number.parseInt(firstChunk, 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatSessionNumber(dbWorkoutIndex: number): string {
  return `Session #${dbWorkoutIndex + SESSION_OFFSET}`;
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

  const workingWeight = Math.max(...completedSets.map((setLog) => setLog.weight));
  const topSet = completedSets.find((setLog) => setLog.weight === workingWeight) ?? completedSets[0];
  const workingReps = topSet.reps;

  return {
    value: progressMetric === "reps" ? workingReps : workingWeight,
    weight: workingWeight,
    reps: workingReps,
  };
}
