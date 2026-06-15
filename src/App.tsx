/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Info, Shield, RefreshCw } from "lucide-react";
import { Theme, EffectType, SystemStatus } from "./types";
import SimulationCanvas from "./components/SimulationCanvas";

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read from localStorage or default to dark
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("atmospheric-theme") as Theme;
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    }
    return "dark";
  });

  const [activeEffect, setActiveEffect] = useState<EffectType | null>(null);
  const [isSpawning, setIsSpawning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [status, setStatus] = useState<SystemStatus>("idle");

  // Synchronize HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("atmospheric-theme", theme);
  }, [theme]);

  // Handle countdown timers and cleardown phases
  useEffect(() => {
    if (!isSpawning || !activeEffect) return;

    const startTime = Date.now();
    let frameId: number;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed >= 5000) {
        setIsSpawning(false);
        setElapsedTime(5000);
        setStatus("cleardown");

        // Autotransition from cleardown back to idle after particles leave (4 seconds)
        const idleTimeout = setTimeout(() => {
          setStatus("idle");
          setActiveEffect(null);
          setElapsedTime(0);
        }, 4000);

        return () => clearTimeout(idleTimeout);
      } else {
        setElapsedTime(elapsed);
        setStatus(activeEffect === "snow" ? "active_snow" : "active_balloon");
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isSpawning, activeEffect]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const startEffect = (type: EffectType) => {
    setElapsedTime(0);
    setIsSpawning(true);
    setActiveEffect(type);
    setStatus(type === "snow" ? "active_snow" : "active_balloon");
  };

  // Convert status to user-friendly label
  const getStatusLabel = () => {
    switch (status) {
      case "idle":
        return "System Status: Idle";
      case "active_snow":
        return "System Status: Active (Snow)";
      case "active_balloon":
        return "System Status: Active (Balloons)";
      case "cleardown":
        return "System Status: Cleardown Cycle";
      default:
        return "System Status: Idle";
    }
  };

  const progressPercent = (elapsedTime / 5000) * 100;
  const displayTime = (elapsedTime / 1000).toFixed(1);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden theme-transition select-none">
      {/* Dynamic Background Particle Simulation Canvas */}
      <SimulationCanvas
        activeEffect={activeEffect}
        isSpawning={isSpawning}
        theme={theme}
      />

      {/* Decorative atmospheric mesh gradient overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000 select-none">
        <div
          className="absolute top-1/4 left-1/3 w-[550px] h-[550px] rounded-full blur-[140px] transition-all duration-1000"
          style={{
            backgroundColor:
              activeEffect === "snow"
                ? "var(--accent-snow)"
                : activeEffect === "balloon"
                ? "var(--accent-balloon)"
                : "transparent",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full blur-[160px] transition-all duration-1000"
          style={{
            backgroundColor:
              activeEffect === "balloon"
                ? "var(--accent-balloon)"
                : activeEffect === "snow"
                ? "var(--accent-snow)"
                : "transparent",
          }}
        />
      </div>

      {/* Formal Interactive Controller Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        id="controlPanelCard"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
        className="relative z-10 w-full max-w-[480px] p-10 rounded-3xl border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-left theme-transition backdrop-blur-md"
      >
        {/* Header Block */}
        <div className="flex items-center justify-between mb-8 select-none text-[var(--text-secondary)]">
          <div
            style={{
              color: "var(--accent-snow)",
              borderColor: "var(--card-border)",
            }}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded font-mono text-[10px] font-bold tracking-widest uppercase bg-white/2 shadow-sm transition-all border"
          >
            <span>System v4.0.2</span>
          </div>

          <button
            onClick={toggleTheme}
            style={{ borderColor: "var(--card-border)" }}
            className="w-10 h-10 flex items-center justify-center rounded-xl border cursor-pointer hover:text-[var(--text-primary)] hover:bg-[var(--btn-bg)] active:scale-95 transition-all outline-none"
            title="Toggle theme mode"
            aria-label="Toggle Theme Button"
            id="themeToggleBtn"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {theme === "light" ? (
                  <Sun className="w-[18px] h-[18px] text-amber-500" />
                ) : (
                  <Moon className="w-[18px] h-[18px] text-sky-400" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {/* Title and Description */}
        <div className="mb-10 select-none">
          <h1
            style={{ color: "var(--text-primary)" }}
            className="font-serif text-3xl font-normal tracking-tight text-left mb-3 theme-transition"
            id="controlTitle"
          >
            Atmospheric Module
          </h1>
          <p
            style={{ color: "var(--text-secondary)" }}
            className="text-sm font-light leading-relaxed text-left theme-transition"
            id="controlDesc"
          >
            Precision environmental simulation controller for high-fidelity particle rendering. Adjust system parameters to initiate thermal or festive particle streams.
          </p>
        </div>

        {/* Buttons Action Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10" id="actionGrid">
          {/* Snowflakes Trigger */}
          <button
            onClick={() => startEffect("snow")}
            style={{
              backgroundColor: activeEffect === "snow" ? "rgba(56, 189, 248, 0.05)" : "rgba(255, 255, 255, 0.02)",
              borderColor: activeEffect === "snow" ? "var(--accent-snow)" : "var(--card-border)",
              color: activeEffect === "snow" ? "var(--accent-snow)" : "var(--text-primary)",
            }}
            className={`flex flex-col items-center justify-center gap-3 h-[120px] rounded-2xl border transition-all duration-300 cursor-pointer outline-none active:scale-95`}
            id="btnSnow"
          >
            <motion.svg
              animate={{ rotate: activeEffect === "snow" ? [0, 30, 0, -30, 0] : 0 }}
              transition={{
                repeat: activeEffect === "snow" ? Infinity : 0,
                duration: 2.5,
                ease: "easeInOut",
              }}
              viewBox="0 0 24 24"
              className="w-8 h-8 fill-current opacity-85"
            >
              <path d="M12,2A1,1,0,0,0,11,3V6.18L8.82,4A1,1,0,1,0,7.41,5.41L9.59,7.59,6.18,9H3a1,1,0,0,0,0,2H6.18l-1,1-1-1A1,1,0,0,0,2.82,12.41l2.18,2.18A1,1,0,0,0,6.41,13.18l-1-1,1-1H9.59l-2.18,2.18a1,1,0,0,0,1.41,1.41L11,12.59V15.18l-3.59,1.41a1,1,0,1,0,.76,1.85L11,17.24V21a1,1,0,0,0,2,0V17.24l2.82,1.2a1,1,0,0,0,.76-1.85L13,15.18V12.59l2.18,2.18a1,1,0,0,0,1.41-1.41L14.41,11.18h3.41l-1,1a1,1,0,0,0,1.41,1.41l2.18-2.18A1,1,0,0,0,19.18,10H16l-1-1,1-1h3.18a1,1,0,0,0,0-2H16l-2.18-2.18a1,1,0,0,0-1.41,1.41L14.59,7.59,13,6.18V3A1,1,0,0,0,12,2Z" />
            </motion.svg>
            <span className="text-[12px] font-semibold text-center uppercase tracking-wider">Snowflakes</span>
          </button>

          {/* Balloons Trigger */}
          <button
            onClick={() => startEffect("balloon")}
            style={{
              backgroundColor: activeEffect === "balloon" ? "rgba(251, 113, 133, 0.05)" : "rgba(255, 255, 255, 0.02)",
              borderColor: activeEffect === "balloon" ? "var(--accent-balloon)" : "var(--card-border)",
              color: activeEffect === "balloon" ? "var(--accent-balloon)" : "var(--text-primary)",
            }}
            className={`flex flex-col items-center justify-center gap-3 h-[120px] rounded-2xl border transition-all duration-300 cursor-pointer outline-none active:scale-95`}
            id="btnBalloon"
          >
            <motion.svg
              animate={{ y: activeEffect === "balloon" ? [0, -4, 0] : 0 }}
              transition={{
                repeat: activeEffect === "balloon" ? Infinity : 0,
                duration: 1.6,
                ease: "easeInOut",
              }}
              viewBox="0 0 24 24"
              className="w-8 h-8 fill-current opacity-85"
            >
              <path d="M12,2A7,7,0,0,0,5,9c0,3.5,2.5,6.5,5.8,7l-.8,1.5a1,1,0,0,0,.8,1.5h1.4c-.1.7-.5,1.7-1.7,2.5a1,1,0,0,0,1.1,1.7c1.8-1.2,2.4-2.7,2.6-3.7a1,1,0,0,0,1-1H16.6l-.8-1.5c3.3-.5,5.8-3.5,5.8-7A7,7,0,0,0,12,2Zm3,8a1,1,0,0,1-1,1,1,1,0,0,1,0-2A1,1,0,0,1,15,10Z" />
            </motion.svg>
            <span className="text-[12px] font-semibold text-center uppercase tracking-wider">Balloons</span>
          </button>
        </div>

        {/* Metric and Progress Section */}
        <div
          style={{ borderColor: "var(--card-border)" }}
          className="pt-8 border-t select-none theme-transition"
          id="statusContainer"
        >
          <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-wider mb-4 text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              {isSpawning && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="flex items-center"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                </motion.div>
              )}
              {status === "cleardown" && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-amber-500"
                />
              )}
              {status === "idle" && (
                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" />
              )}
              <span id="statusText" className="ml-1">{getStatusLabel()}</span>
            </div>
            <span id="timerDisplay" className="text-[var(--text-primary)]">
              {displayTime} SEC
            </span>
          </div>

          {/* Progress track */}
          <div
            style={{ backgroundColor: "var(--card-border)" }}
            className="w-full h-1 rounded-full overflow-hidden theme-transition"
          >
            <div
              style={{
                width: `${progressPercent}%`,
                backgroundColor:
                  activeEffect === "snow"
                    ? "var(--accent-snow)"
                    : activeEffect === "balloon"
                    ? "var(--accent-balloon)"
                    : "var(--card-border)",
                boxShadow: activeEffect === "snow"
                  ? "0 0 12px var(--accent-snow)"
                  : activeEffect === "balloon"
                  ? "0 0 12px var(--accent-balloon)"
                  : "none",
              }}
              className="h-full rounded-full transition-all duration-100 ease-linear"
              id="progressBar"
            />
          </div>
        </div>

        {/* Dynamic environmental parameter stats board */}
        <div
          style={{ borderColor: "var(--card-border)" }}
          className="mt-8 flex gap-4 pt-6 border-t select-none theme-transition text-left"
          id="parameterDashboard"
        >
          <div className="flex-1">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-mono mb-1">Density</div>
            <div className="text-lg font-mono font-medium text-[var(--text-primary)]">
              {activeEffect === "snow" ? "84%" : activeEffect === "balloon" ? "42%" : "0%"}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-mono mb-1">Velocity</div>
            <div className="text-lg font-mono font-medium text-[var(--text-primary)]">
              {activeEffect === "snow" ? "1.4m/s" : activeEffect === "balloon" ? "1.8m/s" : "0.0m/s"}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-mono mb-1">Vector</div>
            <div className="text-lg font-mono font-medium text-[var(--text-primary)]">
              {activeEffect === "snow" ? "12° Drift" : activeEffect === "balloon" ? "Vertical" : "Standby"}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

