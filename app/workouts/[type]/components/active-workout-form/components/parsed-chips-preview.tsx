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
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
            >
              {chip.label}
            </span>
          );
        }

        if (chip.type === "set") {
          return (
            <span
              key={`chip-${idx}-${chip.setIndex}`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-800/90 text-zinc-200 border border-zinc-700/60"
            >
              <strong className="text-white mr-1">S{chip.setIndex}:</strong>
              {chip.label}
            </span>
          );
        }

        return (
          <span
            key={`chip-${idx}-${chip.type}`}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] italic text-zinc-400 bg-zinc-900 border border-zinc-800"
          >
            {chip.label}
          </span>
        );
      })}
    </div>
  );
}
