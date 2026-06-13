// lib/simulation/renderers.ts
import { CONFIG, OBSTACLE_SYMBOLS, Utils } from "./config";
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

    // Bind resize listener so it redraws properly if browser changes size
    window.addEventListener("resize", () => this.resize());
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

  renderGrid() {
    const ctx = this.ctx;
    const cs = CONFIG.cellSize;
    ctx.fillStyle = "#0a1018";
    ctx.fillRect(0, 0, this.displayW, this.displayH);
    ctx.strokeStyle = "rgba(0, 212, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.offsetX, this.offsetY, this.mapW, this.mapH);

    for (let y = 0; y < this.world.rows; y++) {
      for (let x = 0; x < this.world.cols; x++) {
        const pos = this.toScreen(x, y);
        const t = this.world.tiles[y][x];
        if (t === 1) {
          ctx.fillStyle = "#141c28";
          ctx.fillRect(pos.x, pos.y, cs, cs);
        } else if (t === 2) {
          ctx.fillStyle = "#1a2840";
          ctx.fillRect(pos.x + 1, pos.y + 1, cs - 2, cs - 2);
        } else if (t === 3) {
          ctx.fillStyle = "#2a1a18";
          ctx.fillRect(pos.x, pos.y, cs, cs);
        } else if (t === 4) {
          ctx.fillStyle = "rgba(80, 60, 40, 0.35)";
          ctx.fillRect(pos.x, pos.y, cs, cs);
        }
      }
    }
  }

  renderRoutes() {
    this.robots.forEach((robot) => {
      const path = robot.pathSimulator?.fullPath;
      if (!path || path.length < 2) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = robot.color;
      ctx.lineWidth = Math.max(1.5, CONFIG.cellSize * 0.12);
      ctx.setLineDash([5, 3]);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      const start = this.toScreen(path[0].x, path[0].y);
      ctx.moveTo(start.x + CONFIG.cellSize / 2, start.y + CONFIG.cellSize / 2);
      for (let i = 1; i < path.length; i++) {
        const p = this.toScreen(path[i].x, path[i].y);
        ctx.lineTo(p.x + CONFIG.cellSize / 2, p.y + CONFIG.cellSize / 2);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  renderRobots() {
    const ctx = this.ctx;
    const cs = CONFIG.cellSize;
    this.robots.forEach((robot) => {
      const pos = this.toScreen(robot.x, robot.y);
      const cx = pos.x + cs / 2;
      const cy = pos.y + cs / 2;
      const s = cs * 0.85;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(robot.angle);

      // Robot Body
      ctx.fillStyle = "#2a3a50";
      ctx.fillRect(-s * 0.3, -s * 0.2, s * 0.6, s * 0.4);
      ctx.strokeStyle = robot.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(-s * 0.3, -s * 0.2, s * 0.6, s * 0.4);

      // Direction Indicator
      ctx.fillStyle = robot.color;
      ctx.beginPath();
      ctx.moveTo(s * 0.3, 0);
      ctx.lineTo(s * 0.5, -s * 0.12);
      ctx.lineTo(s * 0.5, s * 0.12);
      ctx.fill();
      ctx.restore();

      // Label
      ctx.fillStyle = robot.color;
      ctx.font = `bold ${Math.max(8, cs * 0.3)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(robot.name, cx, cy - s * 0.5);
    });
  }

  renderObstacles() {
    const ctx = this.ctx;
    const cs = CONFIG.cellSize;

    // Render dynamic debris
    Array.from(this.world.avoidableObstacles).forEach((obsKey) => {
      const [x, y] = obsKey.split(",").map(Number);
      const pos = this.toScreen(x, y);
      ctx.fillStyle = "#ff3b5c";
      ctx.fillRect(pos.x + 2, pos.y + 2, cs - 4, cs - 4);
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(pos.x + 2, pos.y + 2, cs - 4, cs - 4);
    });
  }

  render(time: number) {
    this.renderGrid();
    this.renderObstacles();
    this.renderRoutes();
    this.renderRobots();
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

    window.addEventListener("resize", () => this.resize());
    this._initNetwork();
    this.resize();
  }

  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    const dpr = window.devicePixelRatio || 1;
    this.w = container.clientWidth;
    this.h = container.clientHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _initNetwork() {
    const layers = [4, 6, 5, 3];
    let nodeId = 0;
    layers.forEach((count, li) => {
      for (let i = 0; i < count; i++) {
        this.nodes.push({
          id: nodeId++,
          layer: li,
          index: i,
          pulse: Utils.rand(0, Math.PI * 2),
          activity: 0,
        });
      }
    });
    for (let li = 0; li < layers.length - 1; li++) {
      const curr = this.nodes.filter((n) => n.layer === li);
      const next = this.nodes.filter((n) => n.layer === li + 1);
      curr.forEach((a) =>
        next.forEach((b) => {
          if (Math.random() > 0.35)
            this.connections.push({
              from: a.id,
              to: b.id,
              strength: Utils.rand(0.2, 1),
            });
        }),
      );
    }
  }

  triggerPulse() {
    const inputNodes = this.nodes.filter((n) => n.layer === 0);
    inputNodes.forEach((n) => {
      if (Math.random() > 0.5) this.activeNodes.add(n.id);
    });
    setTimeout(() => this.activeNodes.clear(), 600);
  }

  _getNodePos(node: any) {
    const layerCount = [4, 6, 5, 3][node.layer];
    return {
      x: ((node.layer + 1) / 5) * this.w,
      y: ((node.index + 1) / (layerCount + 1)) * this.h,
    };
  }

  render(time: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    this.nodes.forEach((node) => {
      const pos = this._getNodePos(node);
      const isActive = this.activeNodes.has(node.id);
      ctx.fillStyle = isActive ? "#a855f7" : "#334155";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isActive ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
