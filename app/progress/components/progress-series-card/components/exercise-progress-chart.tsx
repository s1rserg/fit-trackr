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
      const y = height - ((point.value - minValue) / range) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");
}

export function ExerciseProgressChart({ series }: ExerciseProgressChartProps) {
  const width = 320;
  const height = 110;
  const polylinePoints = buildPolyline(series.points, width, height);
  const values = series.points.map((point) => point.value);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const metricLabel = series.progressMetric === "reps" ? "reps" : "kg";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/30 p-3">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-300">Current</p>
          <p className="mt-0.5 font-mono text-base font-extrabold text-white">
            {series.currentValue} {metricLabel}
          </p>
          <p className="text-[11px] text-purple-300/70">
            {series.currentWeight}kg × {series.currentReps}r
          </p>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/30 p-3">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">Personal Best</p>
          <p className="mt-0.5 font-mono text-base font-extrabold text-white">
            {series.bestValue} {metricLabel}
          </p>
          <p className="text-[11px] text-purple-300/70">
            {series.bestWeight}kg × {series.bestReps}r
          </p>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/30 p-3">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-300">Entries</p>
          <p className="mt-0.5 font-mono text-base font-extrabold text-white">{series.entriesCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-500/20 bg-secondary/20 p-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-purple-300/70">
          <span>Min: {minValue} {metricLabel}</span>
          <span>Max: {maxValue} {metricLabel}</span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-28 w-full overflow-visible"
          aria-label={`Progress chart for ${series.name}`}
          role="img"
        >
          <defs>
            <linearGradient id={`gradient-${series.name.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="0" y1={height} x2={width} y2={height} stroke="rgba(168, 85, 247, 0.2)" strokeDasharray="3 3" />
          <polyline
            fill="none"
            points={polylinePoints}
            stroke="#a855f7"
            strokeWidth="3.5"
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
                : height - ((point.value - minValue) / range) * (height - 16) - 8;

            return (
              <circle
                key={`${point.workoutId}-${index}`}
                cx={x}
                cy={y}
                r="4.5"
                className="fill-emerald-400 stroke-purple-950"
                strokeWidth="2.5"
              />
            );
          })}
        </svg>

        <div className="mt-2 flex items-center justify-between text-[11px] text-purple-300/60 font-mono">
          <span>
            {new Intl.DateTimeFormat("en-US", {
              day: "numeric",
              month: "short",
            }).format(new Date(series.points[0].dateCompleted))}
          </span>
          <span>
            {new Intl.DateTimeFormat("en-US", {
              day: "numeric",
              month: "short",
            }).format(new Date(series.points[series.points.length - 1].dateCompleted))}
          </span>
        </div>
      </div>
    </div>
  );
}
