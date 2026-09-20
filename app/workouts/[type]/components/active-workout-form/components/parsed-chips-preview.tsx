"use client";

import type { ParsedChip } from "@/features/workouts/parser";

interface ParsedChipsPreviewProps {
  chips: readonly ParsedChip[];
}

export function ParsedChipsPreview({ chips }: ParsedChipsPreviewProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {chips.map((chip, idx) => {
        if (chip.type === "warmup") {
          return (
            <span
              key={`chip-${idx}-${chip.type}`}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30"
            >
              R
            </span>
          );
        }

        if (chip.type === "set") {
          return (
            <span
              key={`chip-${idx}-${chip.setIndex}`}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/80"
            >
              {chip.label}
            </span>
          );
        }

        return (
          <span
            key={`chip-${idx}-${chip.type}`}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs italic text-zinc-400 bg-zinc-900 border border-zinc-800"
          >
            {chip.label}
          </span>
        );
      })}
    </div>
  );
}
