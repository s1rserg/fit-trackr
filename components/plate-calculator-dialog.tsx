"use client";

import React, { useState } from "react";
import { Calculator, Disc, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export function PlateCalculatorDialog({ defaultWeight = 60 }: { defaultWeight?: number }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [targetWeight, setTargetWeight] = useState<number>(defaultWeight);
  const [barWeight, setBarWeight] = useState<number>(20);

  const weightToDistribute = Math.max(0, targetWeight - barWeight);
  const weightPerSide = weightToDistribute / 2;

  const calculatePlates = (targetPerSide: number) => {
    let remaining = targetPerSide;
    const result: { plate: number; count: number }[] = [];

    for (const plate of AVAILABLE_PLATES) {
      if (remaining >= plate) {
        const count = Math.floor(remaining / plate);
        result.push({ plate, count });
        remaining = Math.round((remaining - count * plate) * 100) / 100;
      }
    }

    return { plates: result, remainder: remaining };
  };

  const { plates, remainder } = calculatePlates(weightPerSide);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 gap-1.5 rounded-xl border-purple-500/30 bg-purple-950/40 text-xs text-purple-200 hover:bg-purple-900/60"
      >
        <Calculator className="h-3.5 w-3.5 text-purple-400" />
        Plates
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md p-6 glass-card border border-purple-500/30 text-card-foreground rounded-3xl purple-glow">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Disc className="h-5 w-5 text-primary animate-spin" style={{ animationDuration: "10s" }} />
                Plate Calculator
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-purple-300">Target Weight (kg)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={targetWeight || ""}
                    onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-secondary/40 border-purple-500/20 text-white font-mono text-base focus-visible:ring-purple-500"
                  />
                </div>
                <div>
                  <Label className="text-xs text-purple-300">Bar / Sled (kg)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={barWeight}
                    onChange={(e) => setBarWeight(parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-secondary/40 border-purple-500/20 text-white font-mono text-base focus-visible:ring-purple-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-secondary/30 p-4">
                <div className="flex justify-between items-center pb-3 mb-3 border-b border-purple-500/15">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Load Per Side</span>
                  <span className="font-mono text-xl font-extrabold text-white">{weightPerSide} kg</span>
                </div>

                {plates.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No plates required (target equals or is below bar/sled weight).
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {plates.map(({ plate, count }) => (
                        <div
                          key={plate}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-purple-500/20 bg-purple-950/60"
                        >
                          <span className="font-mono font-bold text-purple-200">{plate} kg</span>
                          <span className="px-2 py-0.5 rounded-md bg-primary/20 text-xs font-bold text-white">
                            × {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {remainder > 0 && (
                  <p className="text-xs text-amber-400 mt-3 pt-2 border-t border-purple-500/10">
                    ⚠️ {remainder} kg unallocated (not exact match with standard plates).
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="default"
                className="w-full h-11 rounded-2xl bg-primary text-white font-bold"
                onClick={() => setIsOpen(false)}
              >
                Close Calculator
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
