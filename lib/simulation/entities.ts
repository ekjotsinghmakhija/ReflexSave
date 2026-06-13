// lib/simulation/entities.ts
import { CONFIG, Utils } from "./config";
import { World } from "./world";

export class PathSimulator {
  world: World;
  waypoints: any[];
  fullPath: any[];
  targetSurvivor: any | null;
  routeReachable: boolean;

  constructor(world: World) {
    this.world = world;
    this.waypoints = [];
    this.fullPath = [];
    this.targetSurvivor = null;
    this.routeReachable = true;
  }

  computeRoute(
    robotX: number,
    robotY: number,
    robotIndex = 0,
    robotCount = CONFIG.robotCount,
  ) {
    let active = this.world.survivors.filter(
      (s) =>
        !s.rescued && !s.abandoned && (s.id - 1) % robotCount === robotIndex,
    );
    if (active.length === 0) {
      active = this.world.survivors.filter((s) => !s.rescued && !s.abandoned);
    }
    if (active.length === 0) {
      this.waypoints = [];
      this.fullPath = [];
      this.targetSurvivor = null;
      return;
    }

    const priority: Record<string, number> = { critical: 0, risk: 1, safe: 2 };
    active.sort((a, b) => {
      const pd = priority[a.zone] - priority[b.zone];
      if (pd !== 0) return pd;
      return (
        Utils.dist(robotX, robotY, a.x, a.y) -
        Utils.dist(robotX, robotY, b.x, b.y)
      );
    });

    this.targetSurvivor = active[0];
    const target = this.targetSurvivor;

    this.fullPath = this._buildVisualPath(robotX, robotY, target.x, target.y);
    this.waypoints = this.fullPath.filter(
      (_, i) => i % 2 === 0 || i === this.fullPath.length - 1,
    );
    const pathEnd = this.fullPath[this.fullPath.length - 1];
    this.routeReachable =
      pathEnd && Utils.dist(pathEnd.x, pathEnd.y, target.x, target.y) < 3;
  }

  _buildVisualPath(sx: number, sy: number, tx: number, ty: number) {
    const bfsPath = this.world.findPathBFS(sx, sy, tx, ty);
    if (bfsPath && bfsPath.length > 1) return bfsPath;

    // Paste your fallback greedy detour logic here from script.js
    const path = [{ x: sx, y: sy }];
    const targetCell = this.world.findNearestWalkable(tx, ty);
    path.push({ x: targetCell.x, y: targetCell.y });
    return path;
  }
}

export class Robot {
  x: number;
  y: number;
  id: number;
  name: string;
  color: string;
  glow: string;
  trailRgb: string;
  robotIndex: number;
  pathSimulator: PathSimulator | null;
  path: any[] = [];
  targetX: number;
  targetY: number;
  angle: number;
  trail: any[];
  maxTrail: number;
  speed: number;
  waypointIndex: number;
  obstaclesAvoided: number;
  stuckTicks: number;
  state: string;

  constructor(x: number, y: number, def: any, robotIndex: number) {
    this.x = x;
    this.y = y;
    this.id = def.id;
    this.name = def.name;
    this.color = def.color;
    this.glow = def.glow;
    this.trailRgb = def.trail;
    this.robotIndex = robotIndex;
    this.pathSimulator = null;
    this.targetX = x;
    this.targetY = y;
    this.angle = 0;
    this.trail = [];
    this.maxTrail = 80;
    this.speed = CONFIG.robotSpeed;
    this.waypointIndex = 0;
    this.obstaclesAvoided = 0;
    this.stuckTicks = 0;
    this.state = "patrol";
  }

  setPath(path: any[]) {
    this.path = (path || []).filter((p) => p && typeof p.x === "number");
    this.waypointIndex = 0;
    this.stuckTicks = 0;
    if (this.path.length > 0) {
      this.targetX = this.path[0].x;
      this.targetY = this.path[0].y;
    }
  }

  // Paste _tryMove(), update(), and atTarget() from script.js here
  update(world: World) {
    /* ... */
  }
  atTarget(threshold = 1.2) {
    return false; /* ... */
  }
}
