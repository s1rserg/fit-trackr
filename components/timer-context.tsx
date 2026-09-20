"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface TimerState {
  targetEndTime: number | null;
  totalDuration: number;
  pausedSeconds: number | null;
  isRunning: boolean;
  soundEnabled: boolean;
  isMinimized: boolean;
  isOpen: boolean;
}

export interface TimerActionsType {
  startPreset: (seconds: number) => void;
  togglePlayPause: () => void;
  resetTimer: () => void;
  addTime: (seconds: number) => void;
  setSoundEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  setIsMinimized: (minimized: boolean | ((prev: boolean) => boolean)) => void;
  openTimer: () => void;
  closeTimer: () => void;
}

interface TimerContextType extends TimerActionsType {
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  soundEnabled: boolean;
  isMinimized: boolean;
  isOpen: boolean;
}

const STORAGE_KEY = "fittrackr_timer_state_v1";

const DEFAULT_STATE: TimerState = {
  targetEndTime: null,
  totalDuration: 90,
  pausedSeconds: null,
  isRunning: false,
  soundEnabled: true,
  isMinimized: false,
  isOpen: false,
};

const TimerActionsContext = createContext<TimerActionsType | undefined>(undefined);
const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: TimerState = JSON.parse(saved);
        return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_STATE;
  });

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (state.isRunning && state.targetEndTime) {
      return Math.max(0, Math.ceil((state.targetEndTime - Date.now()) / 1000));
    }
    return state.pausedSeconds ?? state.totalDuration;
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore write errors
    }
  }, [state]);

  const playBeep = useCallback(() => {
    if (!state.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.onended = () => {
        try {
          audioCtx.close();
        } catch {
          // Ignore audio close error
        }
      };

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio context restricted before user interaction
    }
  }, [state.soundEnabled]);

  // Main countdown ticker based on wall-clock time
  // Sleeps completely when screen is off / document.hidden to maximize battery life
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const tick = () => {
      if (!state.targetEndTime) return;
      const remaining = Math.max(0, Math.ceil((state.targetEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        playBeep();
        setState((prev) => ({
          ...prev,
          isRunning: false,
          targetEndTime: null,
          pausedSeconds: 0,
        }));
      }
    };

    const handleVisibility = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        // Stop timer ticker when screen locked or tab hidden
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      } else {
        // Resumed: immediately sync wall-clock time
        tick();
        if (state.isRunning && state.targetEndTime && !interval) {
          interval = setInterval(tick, 1000);
        }
      }
    };

    if (state.isRunning && state.targetEndTime) {
      tick();
      if (typeof document === "undefined" || !document.hidden) {
        interval = setInterval(tick, 1000);
      }
      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", handleVisibility);
      }
    } else {
      setTimeLeft(state.pausedSeconds ?? state.totalDuration);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [state.isRunning, state.targetEndTime, state.pausedSeconds, state.totalDuration, playBeep]);

  const startPreset = useCallback((seconds: number) => {
    const targetEndTime = Date.now() + seconds * 1000;
    setState((prev) => ({
      ...prev,
      totalDuration: seconds,
      targetEndTime,
      pausedSeconds: null,
      isRunning: true,
      isOpen: true,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    setState((prev) => {
      if (prev.isRunning) {
        const remaining = prev.targetEndTime ? Math.max(0, Math.ceil((prev.targetEndTime - Date.now()) / 1000)) : prev.totalDuration;
        return {
          ...prev,
          isRunning: false,
          targetEndTime: null,
          pausedSeconds: remaining,
        };
      }
      const secondsToRun = prev.pausedSeconds && prev.pausedSeconds > 0 ? prev.pausedSeconds : prev.totalDuration;
      return {
        ...prev,
        isRunning: true,
        targetEndTime: Date.now() + secondsToRun * 1000,
        pausedSeconds: null,
        isOpen: true,
      };
    });
  }, []);

  const resetTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      targetEndTime: Date.now() + prev.totalDuration * 1000,
      pausedSeconds: null,
      isRunning: true,
    }));
  }, []);

  const addTime = useCallback((seconds: number) => {
    setState((prev) => {
      if (prev.isRunning && prev.targetEndTime) {
        const newEndTime = prev.targetEndTime + seconds * 1000;
        const newRemaining = Math.max(0, Math.ceil((newEndTime - Date.now()) / 1000));
        return {
          ...prev,
          targetEndTime: newEndTime,
          totalDuration: Math.max(prev.totalDuration, newRemaining),
        };
      }
      const currentPaused = prev.pausedSeconds ?? prev.totalDuration;
      const newRemaining = Math.max(0, currentPaused + seconds);
      return {
        ...prev,
        pausedSeconds: newRemaining,
        totalDuration: Math.max(prev.totalDuration, newRemaining),
      };
    });
  }, []);

  const setSoundEnabled = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setState((prev) => ({
      ...prev,
      soundEnabled: typeof value === "function" ? value(prev.soundEnabled) : value,
    }));
  }, []);

  const setIsMinimized = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setState((prev) => ({
      ...prev,
      isMinimized: typeof value === "function" ? value(prev.isMinimized) : value,
    }));
  }, []);

  const openTimer = useCallback(() => {
    setState((prev) => {
      if (prev.isOpen) return prev;
      return { ...prev, isOpen: true };
    });
  }, []);

  const closeTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      isRunning: false,
      targetEndTime: null,
      pausedSeconds: null,
    }));
  }, []);

  const actions = useMemo<TimerActionsType>(
    () => ({
      startPreset,
      togglePlayPause,
      resetTimer,
      addTime,
      setSoundEnabled,
      setIsMinimized,
      openTimer,
      closeTimer,
    }),
    [startPreset, togglePlayPause, resetTimer, addTime, setSoundEnabled, setIsMinimized, openTimer, closeTimer],
  );

  const contextValue = useMemo<TimerContextType>(
    () => ({
      ...actions,
      timeLeft,
      totalDuration: state.totalDuration,
      isRunning: state.isRunning,
      soundEnabled: state.soundEnabled,
      isMinimized: state.isMinimized,
      isOpen: state.isOpen,
    }),
    [actions, timeLeft, state.totalDuration, state.isRunning, state.soundEnabled, state.isMinimized, state.isOpen],
  );

  return (
    <TimerActionsContext.Provider value={actions}>
      <TimerContext.Provider value={contextValue}>
        {children}
      </TimerContext.Provider>
    </TimerActionsContext.Provider>
  );
}

export function useTimerActions() {
  const context = useContext(TimerActionsContext);
  if (!context) {
    throw new Error("useTimerActions must be used within a TimerProvider");
  }
  return context;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
