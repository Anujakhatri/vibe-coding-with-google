import { useEffect, useRef } from "react";
import { Theme, EffectType } from "../types";

interface SimulationCanvasProps {
  activeEffect: EffectType | null;
  isSpawning: boolean;
  theme: Theme;
}

export default function SimulationCanvas({
  activeEffect,
  isSpawning,
  theme,
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Use refs for particle lists and state to prevent useEffect stale closure issues and maximize rendering performace
  const particlesRef = useRef<any[]>([]);
  const isSpawningRef = useRef(isSpawning);
  const activeEffectRef = useRef(activeEffect);
  const themeRef = useRef(theme);
  const lastSpawnTimeRef = useRef<number>(0);

  // Synchronize state values to refs
  useEffect(() => {
    isSpawningRef.current = isSpawning;
  }, [isSpawning]);

  useEffect(() => {
    activeEffectRef.current = activeEffect;
    if (activeEffect) {
      // Clear previous effect particles on switch to prevent awkward mix
      particlesRef.current = [];
    }
  }, [activeEffect]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Handle ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(container);
    resizeCanvas(); // initial size

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Primary animation logic
  useEffect(() => {
    let animationId: number;
    const SPAWN_INTERVAL = 90; // ms

    class SnowflakeParticle {
      radius: number;
      x: number;
      y: number;
      vy: number;
      vx: number;
      opacity: number;
      swaySpeed: number;
      swayOffset: number;

      constructor(width: number) {
        this.radius = Math.random() * 2 + 3.5; // Medium scale: 3.5px to 5.5px
        this.x = Math.random() * width;
        this.y = -20;
        this.vy = Math.random() * 1.2 + 1.3;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.45 + 0.5;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayOffset = Math.random() * Math.PI * 2;
      }

      update() {
        this.swayOffset += this.swaySpeed;
        this.x += this.vx + Math.sin(this.swayOffset) * 0.45;
        this.y += this.vy;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        const isLight = themeRef.current === "light";
        if (isLight) {
          // Vibrant ice-blue flurry in light mode to remain visible against a bright backdrop
          ctx.fillStyle = `rgba(14, 165, 233, ${this.opacity})`;
          ctx.fill();
        } else {
          // Soft white flurry with shadow glow for dark mode
          ctx.fillStyle = `rgba(224, 242, 254, ${this.opacity})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
        }
      }
    }

    class BalloonParticle {
      radius: number;
      x: number;
      y: number;
      vy: number;
      vx: number;
      swaySpeed: number;
      swayOffset: number;
      stringLength: number;
      color: string;

      constructor(width: number, height: number) {
        this.radius = Math.random() * 4 + 13; // Medium scale: 13px to 17px
        this.x = Math.random() * width;
        this.y = height + 40;
        this.vy = -(Math.random() * 1.2 + 1.4);
        this.vx = (Math.random() - 0.5) * 0.25;
        this.swaySpeed = Math.random() * 0.015 + 0.01;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.stringLength = this.radius * 2.3;

        // Palette of clean corporate pastel tones
        const colors = [
          "rgba(14, 165, 233, 0.8)",  // Sky blue
          "rgba(244, 63, 94, 0.8)",   // Rose pink
          "rgba(16, 185, 129, 0.8)",  // Emerald
          "rgba(245, 158, 11, 0.8)",  // Amber
          "rgba(139, 92, 246, 0.8)",  // Purple
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.swayOffset += this.swaySpeed;
        this.x += this.vx + Math.sin(this.swayOffset) * 0.35;
        this.y += this.vy;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const isLight = themeRef.current === "light";

        // 1. Draw Balloon String
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.radius);
        const stringSway = Math.sin(this.swayOffset) * 3;
        ctx.bezierCurveTo(
          this.x + stringSway,
          this.y + this.radius + this.stringLength * 0.4,
          this.x - stringSway,
          this.y + this.radius + this.stringLength * 0.7,
          this.x,
          this.y + this.radius + this.stringLength
        );
        ctx.strokeStyle = isLight
          ? "rgba(15, 23, 42, 0.15)"
          : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 2. Draw Balloon Ellipse Shape
        ctx.beginPath();
        ctx.ellipse(
          this.x,
          this.y,
          this.radius * 0.82,
          this.radius,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = this.color;
        ctx.fill();

        // 3. Highlight reflection (top-left)
        ctx.beginPath();
        ctx.ellipse(
          this.x - this.radius * 0.25,
          this.y - this.radius * 0.35,
          this.radius * 0.18,
          this.radius * 0.26,
          Math.PI / 6,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fill();

        // 4. Balloon tie/knot structure
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.radius);
        ctx.lineTo(this.x - 3, this.y + this.radius + 4);
        ctx.lineTo(this.x + 3, this.y + this.radius + 4);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const tick = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        animationId = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();

      // Handle Particle Spawning
      if (isSpawningRef.current && activeEffectRef.current) {
        if (now - lastSpawnTimeRef.current > SPAWN_INTERVAL) {
          if (activeEffectRef.current === "snow") {
            particlesRef.current.push(new SnowflakeParticle(canvas.width));
          } else if (activeEffectRef.current === "balloon") {
            particlesRef.current.push(new BalloonParticle(canvas.width, canvas.height));
          }
          lastSpawnTimeRef.current = now;
        }
      }

      // Update and Draw Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.update();
        p.draw(ctx);

        // Filter out off-screen particles
        if (p instanceof SnowflakeParticle) {
          return p.y < canvas.height + p.radius * 2;
        } else if (p instanceof BalloonParticle) {
          return p.y > -p.radius * 3;
        }
        return true;
      });

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-1"
      id="simulation-canvas-container"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
        id="simulationCanvas"
      />
    </div>
  );
}
