"use client";

import React from "react";
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, X, Minus } from "lucide-react";

import { useTimer } from "@/components/timer-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  className?: string;
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

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 100;

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-2xl glass-card purple-glow border border-primary/40 text-primary hover:bg-primary/20 transition-all",
          className,
        )}
      >
        <Timer className="h-5 w-5 animate-pulse text-purple-400" />
        <span className="font-mono text-base font-bold text-white">{formatTime(timeLeft)}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-3xl p-4 glass-card purple-glow border border-primary/30 text-card-foreground shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/20 text-purple-300">
            <Timer className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium tracking-wide text-purple-200">Rest Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-white rounded-full"
            onClick={() => setSoundEnabled((prev) => !prev)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-purple-300" /> : <VolumeX className="h-4 w-4 opacity-50" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-white rounded-full"
            onClick={() => setIsMinimized(true)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-white rounded-full"
            onClick={closeTimer}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <div className="font-mono text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300">
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary/80 h-2 rounded-full mt-3 overflow-hidden border border-purple-500/20">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-400 transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(168,85,247,0.6)]"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTime(-10)}
          className="h-9 px-2.5 rounded-xl border-purple-500/20 bg-secondary/50 text-xs hover:bg-purple-900/30"
        >
          -10s
        </Button>
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={togglePlayPause}
          className={cn(
            "h-11 w-11 rounded-2xl shadow-lg transition-transform active:scale-95",
            isRunning ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-primary hover:bg-purple-500 text-white purple-glow-sm",
          )}
        >
          {isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="h-11 w-11 rounded-2xl border-purple-500/30 bg-secondary/50 hover:bg-purple-900/30"
        >
          <RotateCcw className="h-4 w-4 text-purple-300" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTime(30)}
          className="h-9 px-2.5 rounded-xl border-purple-500/20 bg-secondary/50 text-xs hover:bg-purple-900/30"
        >
          +30s
        </Button>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-purple-500/15">
        {[60, 90, 120, 180].map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => startPreset(preset)}
            className={cn(
              "h-7 rounded-lg text-xs font-medium transition-all",
              totalDuration === preset && timeLeft > 0
                ? "bg-primary/20 text-purple-300 border border-primary/40"
                : "text-muted-foreground hover:text-white hover:bg-purple-950/40",
            )}
          >
            {preset >= 60 ? `${preset / 60}m` : `${preset}s`}
          </Button>
        ))}
      </div>
    </div>
  );
}
