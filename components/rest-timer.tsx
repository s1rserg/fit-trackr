"use client";

import { useMemo } from "react";
import { Minus, Pause, Play, RotateCcw, Timer, Volume2, VolumeX, X } from "lucide-react";

import { useTimer } from "@/components/timer-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  className?: string;
}

const PRESET_DURATIONS = [60, 90, 120, 180] as const;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function RestTimer({ className }: RestTimerProps) {
  const {
    timeLeft,
    totalDuration,
    isRunning,
    soundEnabled,
    isMinimized,
    isOpen,
    startPreset,
    togglePlayPause,
    resetTimer,
    addTime,
    setSoundEnabled,
    setIsMinimized,
    closeTimer,
  } = useTimer();

  const progressPercent = useMemo(() => {
    if (totalDuration <= 0) return 100;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [totalDuration, timeLeft]);

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-3.5 py-2 shadow-2xl athletic-card text-zinc-100 hover:bg-zinc-800 transition-all",
          className,
        )}
      >
        <Timer className="h-4 w-4 shrink-0 text-emerald-400" />
        <span className="font-mono text-sm font-bold">{formatTime(timeLeft)}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-80 rounded-2xl p-4 athletic-card shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
            <Timer className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-300">
            Rest Timer
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 shrink-0 text-zinc-300" />
            ) : (
              <VolumeX className="h-4 w-4 shrink-0 text-zinc-600" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize timer"
          >
            <Minus className="h-4 w-4 shrink-0 text-zinc-400 hover:text-white" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg"
            onClick={closeTimer}
            aria-label="Close timer"
          >
            <X className="h-4 w-4 shrink-0 text-zinc-400 hover:text-white" />
          </Button>
        </div>
      </div>

      {/* Time Display */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <div className="font-mono text-3xl font-bold tracking-tight text-white">
          {formatTime(timeLeft)}
        </div>

        {/* Minimal Progress Track */}
        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2.5 mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTime(-10)}
          className="h-9 px-2.5 rounded-lg border-zinc-700 bg-zinc-900 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white"
        >
          -10s
        </Button>

        <Button
          type="button"
          size="icon"
          onClick={togglePlayPause}
          className={cn(
            "h-11 w-11 p-0 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-md",
            isRunning
              ? "bg-amber-500 hover:bg-amber-400 text-zinc-950"
              : "bg-white hover:bg-zinc-200 text-zinc-950",
          )}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
            <Pause className="h-5 w-5 shrink-0 fill-current text-zinc-950" />
          ) : (
            <Play className="h-5 w-5 shrink-0 fill-current text-zinc-950 ml-0.5" />
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="h-11 w-11 p-0 rounded-xl flex items-center justify-center border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-4 w-4 shrink-0 text-zinc-200" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTime(30)}
          className="h-9 px-2.5 rounded-lg border-zinc-700 bg-zinc-900 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white"
        >
          +30s
        </Button>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-zinc-800">
        {PRESET_DURATIONS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => startPreset(preset)}
            className={cn(
              "h-7 rounded-md text-[11px] font-mono transition-all",
              totalDuration === preset && timeLeft > 0
                ? "bg-zinc-800 text-white font-bold border border-zinc-600"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60",
            )}
          >
            {preset >= 60 ? `${preset / 60}m` : `${preset}s`}
          </Button>
        ))}
      </div>
    </div>
  );
}
