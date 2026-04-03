import type { ExerciseProgressSeries } from "@/features/workouts/types";

type ExerciseProgressChartProps = {
  series: ExerciseProgressSeries;
};

function buildPolyline(points: ExerciseProgressSeries["points"], width: number, height: number) {
  if (points.length === 1) {
    const y = height / 2;
    return `0,${y} ${width},${y}`;
  }

  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function ExerciseProgressChart({ series }: ExerciseProgressChartProps) {
  const width = 280;
  const height = 96;
  const polylinePoints = buildPolyline(series.points, width, height);
  const values = series.points.map((point) => point.value);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const metricLabel = series.progressMetric === "reps" ? "reps" : "kg";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-secondary/50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current</p>
          <p className="mt-1 text-lg font-semibold">
            {series.currentValue} {metricLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            {series.currentWeight} kg x {series.currentReps} reps
          </p>
        </div>
        <div className="rounded-2xl bg-secondary/50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Best</p>
          <p className="mt-1 text-lg font-semibold">
            {series.bestValue} {metricLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            {series.bestWeight} kg x {series.bestReps} reps
          </p>
        </div>
        <div className="rounded-2xl bg-secondary/50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Entries</p>
          <p className="mt-1 text-lg font-semibold">{series.entriesCount}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {minValue} {metricLabel}
          </span>
          <span>
            {maxValue} {metricLabel}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-28 w-full overflow-visible"
          aria-label={`Progress chart for ${series.name}`}
          role="img"
        >
          <line x1="0" y1={height} x2={width} y2={height} className="stroke-border" />
          <polyline
            fill="none"
            points={polylinePoints}
            className="stroke-primary"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {series.points.map((point, index) => {
            const x =
              series.points.length === 1
                ? width / 2
                : (index / (series.points.length - 1)) * width;
            const range = Math.max(maxValue - minValue, 1);
            const y =
              series.points.length === 1
                ? height / 2
                : height - ((point.value - minValue) / range) * height;

            return (
              <circle
                key={`${point.workoutId}-${index}`}
                cx={x}
                cy={y}
                r="4"
                className="fill-accent stroke-background"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {new Intl.DateTimeFormat("uk-UA", {
              day: "numeric",
              month: "short",
            }).format(series.points[0].dateCompleted)}
          </span>
          <span>
            {new Intl.DateTimeFormat("uk-UA", {
              day: "numeric",
              month: "short",
            }).format(series.points[series.points.length - 1].dateCompleted)}
          </span>
        </div>
      </div>
    </div>
  );
}
