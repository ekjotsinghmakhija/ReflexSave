// lib/simulation/renderers.ts
import { CONFIG, OBSTACLE_SYMBOLS } from "./config";
import { World } from "./world";
import { Robot } from "./entities";

export class MapRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  world: World;
  robots: Robot[];
  offsetX = 0;
  offsetY = 0;
  displayW = 0;
  displayH = 0;
  mapW = 0;
  mapH = 0;

  constructor(canvas: HTMLCanvasElement, world: World, robots: Robot[]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.world = world;
    this.robots = robots;
    this.resize();
  }

  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    const dpr = window.devicePixelRatio || 1;
    const pad = 4;
    const w = container.clientWidth - pad * 2;
    const h = container.clientHeight - pad * 2;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    CONFIG.cellSize = Math.min(w / CONFIG.gridCols, h / CONFIG.gridRows);
    this.mapW = CONFIG.cellSize * CONFIG.gridCols;
    this.mapH = CONFIG.cellSize * CONFIG.gridRows;
    this.offsetX = (w - this.mapW) / 2;
    this.offsetY = (h - this.mapH) / 2;
    this.displayW = w;
    this.displayH = h;
  }

  toScreen(gx: number, gy: number) {
    return {
      x: this.offsetX + gx * CONFIG.cellSize,
      y: this.offsetY + gy * CONFIG.cellSize,
    };
  }

  // -> PASTE ALL YOUR RENDER METHODS HERE (renderGrid, renderBuildings, etc.) <-
  render(time: number) {
    // this.renderGrid();
    // this.renderBuildings();
    // ...
  }
}

export class NeuralVisualizer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  nodes: any[] = [];
  connections: any[] = [];
  activeNodes = new Set<number>();
  w = 0;
  h = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this._initNetwork();
    this.resize();
  }

  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w;
    this.h = h;
  }

  // -> PASTE _initNetwork, triggerPulse, _getNodePos, render from script.js <-
  _initNetwork() {
    /* ... */
  }
  triggerPulse() {
    /* ... */
  }
  render(time: number) {
    /* ... */
  }
}
