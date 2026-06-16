export type Theme = "dark" | "light";

export type EffectType = "snow" | "balloon";

export type SystemStatus = "idle" | "active_snow" | "active_balloon" | "cleardown";

export interface SnowflakeConfig {
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  opacity: number;
  swaySpeed: number;
  swayOffset: number;
}

export interface BalloonConfig {
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  swaySpeed: number;
  swayOffset: number;
  stringLength: number;
  color: string;
}
