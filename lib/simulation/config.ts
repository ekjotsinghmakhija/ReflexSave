// lib/simulation/config.ts

export const CONFIG = {
  gridCols: 56,
  gridRows: 42,
  cellSize: 0,
  tickInterval: 1500,
  animationFPS: 60,
  robotSpeed: 0.035,
  abandonTimeoutTicks: 14,
  robotCount: 3,
};

export const ROBOT_DEFS = [
  {
    id: 1,
    name: "NR-1",
    color: "#00d4ff",
    glow: "rgba(0, 212, 255, 0.85)",
    trail: "0, 212, 255",
  },
  {
    id: 2,
    name: "NR-2",
    color: "#00e676",
    glow: "rgba(0, 230, 118, 0.85)",
    trail: "0, 230, 118",
  },
  {
    id: 3,
    name: "NR-3",
    color: "#ffd23f",
    glow: "rgba(255, 210, 63, 0.85)",
    trail: "255, 210, 63",
  },
];

export const OBSTACLE_SYMBOLS: Record<string, any> = {
  car: { label: "CAR", name: "Broken car", category: "vehicle" },
  tire: { label: "TIR", name: "Tire", category: "vehicle" },
  metal: { label: "MTL", name: "Metal scrap", category: "vehicle" },
  bike: { label: "BIK", name: "Bike debris", category: "vehicle" },
  slab: { label: "SLB", name: "Concrete slab", category: "building" },
  brick: { label: "BRK", name: "Bricks", category: "building" },
  rod: { label: "ROD", name: "Steel rod", category: "building" },
  glass: { label: "GLS", name: "Broken glass", category: "building" },
  wall: { label: "WAL", name: "Collapsed wall", category: "building" },
};

export const Utils = {
  rand: (min: number, max: number) => Math.random() * (max - min) + min,
  randInt: (min: number, max: number) => Math.floor(Utils.rand(min, max + 1)),
  clamp: (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val)),
  lerp: (a: number, b: number, t: number) => a + (b - a) * t,
  dist: (x1: number, y1: number, x2: number, y2: number) =>
    Math.hypot(x2 - x1, y2 - y1),
  formatTime: (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  },
  nowTimeStr: () => new Date().toLocaleTimeString("en-IN", { hour12: false }),
};
