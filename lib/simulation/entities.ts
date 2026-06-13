import { CONFIG, Utils } from "./config";
import { World } from "./world";

export class PathSimulator {
  world: World;
  waypoints: { x: number; y: number }[];
  fullPath: { x: number; y: number }[];
  targetSurvivor: any | null;
  routeReachable: boolean;

  constructor(world: World) {
    this.world = world;
    this.waypoints = [];
    this.fullPath = [];
    this.targetSurvivor = null;
    this.routeReachable = true;
  }

  /**
   * Synchronous local fallback routing
   */
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

    // Priority: critical > risk > safe, then nearest
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

  /**
   * Asynchronous Backend Pathfinding
   */
  async computeRouteWithBackend(robotX: number, robotY: number, target: any) {
    if (!target) return null;

    // Package the current world state
    const payload = {
      cols: this.world.cols,
      rows: this.world.rows,
      robot_x: Math.floor(robotX),
      robot_y: Math.floor(robotY),
      target_x: Math.floor(target.x),
      target_y: Math.floor(target.y),
      obstacles: Array.from(this.world.avoidableObstacles),
      danger_cracks: Array.from(this.world.dangerCrackCells),
    };

    try {
      const response = await fetch("http://localhost:8000/api/calculate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        this.fullPath = data.waypoints;
        // Filter to every 2nd waypoint to allow smooth client-side interpolation
        this.waypoints = this.fullPath.filter(
          (_, i) => i % 2 === 0 || i === this.fullPath.length - 1,
        );
        return data.confidence;
      } else {
        console.warn("Backend Brain: No path found");
        // Fallback to local routing if backend fails
        this.fullPath = this._buildVisualPath(
          robotX,
          robotY,
          target.x,
          target.y,
        );
        return null;
      }
    } catch (error) {
      console.error(
        "Backend offline. Falling back to local TS heuristics.",
        error,
      );
      this.fullPath = this._buildVisualPath(robotX, robotY, target.x, target.y);
      return null;
    }
  }

  _buildVisualPath(sx: number, sy: number, tx: number, ty: number) {
    const bfsPath = this.world.findPathBFS(sx, sy, tx, ty);
    if (bfsPath && bfsPath.length > 1) return bfsPath;

    // Fallback: greedy detour path
    const path = [{ x: sx, y: sy }];
    let cx = sx;
    let cy = sy;
    let steps = 0;

    while (Utils.dist(cx, cy, tx, ty) > 0.7 && steps < 400) {
      steps++;
      const dx = tx - cx;
      const dy = ty - cy;
      const len = Math.hypot(dx, dy) || 1;
      let nx = cx + (dx / len) * 0.85;
      let ny = cy + (dy / len) * 0.85;

      if (!this.world.canTraverse(cx, cy, nx, ny)) {
        const detours = [
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
          [0, -2],
          [0, 2],
          [-2, 0],
          [2, 0],
        ]
          .map(([dx2, dy2]) => ({ x: cx + dx2, y: cy + dy2 }))
          .sort(
            (a, b) =>
              Utils.dist(a.x, a.y, tx, ty) - Utils.dist(b.x, b.y, tx, ty),
          );

        let found = false;
        for (const d of detours) {
          if (this.world.canTraverse(cx, cy, d.x, d.y)) {
            nx = d.x;
            ny = d.y;
            found = true;
            break;
          }
        }
        if (!found) {
          const safe = this.world.findNearestWalkable(cx, cy);
          nx = safe.x;
          ny = safe.y;
        }
      }

      if (this.world.canTraverse(cx, cy, nx, ny)) {
        cx = nx;
        cy = ny;
        path.push({ x: cx, y: cy });
      }
    }

    const targetCell = this.world.findNearestWalkable(tx, ty);
    path.push({ x: targetCell.x, y: targetCell.y });
    return path;
  }

  _nearestRoad(x: number, y: number) {
    let best = null;
    let bestD = Infinity;
    for (const r of this.world.roads) {
      const d = Utils.dist(x, y, r.x, r.y);
      if (d < bestD) {
        bestD = d;
        best = r;
      }
    }
    return best;
  }

  _smoothPath(path: any[]) {
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
  targetX: number;
  targetY: number;
  angle: number;
  trail: { x: number; y: number; age: number }[];
  maxTrail: number;
  speed: number;
  waypointIndex: number;
  obstaclesAvoided: number;
  stuckTicks: number;
  state: string;
  path: { x: number; y: number }[] = [];

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

  setPath(path: { x: number; y: number }[]) {
    this.path = (path || []).filter((p) => p && typeof p.x === "number");
    this.waypointIndex = 0;
    this.stuckTicks = 0;
    if (this.path.length > 0) {
      this.targetX = this.path[0].x;
      this.targetY = this.path[0].y;
    }
  }

  _tryMove(world: World, nextX: number, nextY: number, moveSpeed: number) {
    if (world.canTraverse(this.x, this.y, nextX, nextY)) {
      return { x: nextX, y: nextY, moved: true, avoided: false };
    }

    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ];

    dirs.sort((a, b) => {
      const da = Math.hypot(
        nextX - (this.x + a.x * moveSpeed),
        nextY - (this.y + a.y * moveSpeed),
      );
      const db = Math.hypot(
        nextX - (this.x + b.x * moveSpeed),
        nextY - (this.y + b.y * moveSpeed),
      );
      return da - db;
    });

    for (const scale of [1, 0.6, 0.35]) {
      const step = moveSpeed * scale;
      for (const d of dirs) {
        const sx = this.x + d.x * step;
        const sy = this.y + d.y * step;
        if (world.canTraverse(this.x, this.y, sx, sy)) {
          return { x: sx, y: sy, moved: true, avoided: true };
        }
      }
    }

    return { x: this.x, y: this.y, moved: false, avoided: false };
  }

  update(world: World) {
    if (!this.path || this.path.length === 0) return;

    if (world && !world.isWalkable(this.x, this.y)) {
      const safe = world.findNearestWalkable(this.x, this.y);
      this.x = safe.x;
      this.y = safe.y;
      this.stuckTicks = 0;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.05) {
      this.angle = Math.atan2(dy, dx);
    }

    if (dist < 0.08) {
      this.waypointIndex++;
      this.stuckTicks = 0;
      if (this.waypointIndex < this.path.length) {
        this.targetX = this.path[this.waypointIndex].x;
        this.targetY = this.path[this.waypointIndex].y;
      }
      return;
    }

    const terrainMult = world
      ? world.getTerrainSpeedMultiplier(this.x, this.y)
      : 1;
    let moveSpeed = this.speed * terrainMult * (dist > 1 ? 1.15 : 1);
    if (this.stuckTicks > 5) moveSpeed *= 1.4;
    if (this.stuckTicks > 12) moveSpeed *= 1.8;

    const nextX = this.x + (dx / dist) * moveSpeed;
    const nextY = this.y + (dy / dist) * moveSpeed;

    const result = world
      ? this._tryMove(world, nextX, nextY, moveSpeed)
      : { x: nextX, y: nextY, moved: true, avoided: false };

    if (result.moved) {
      this.x = world.clampToBounds(result.x, result.y).x;
      this.y = world.clampToBounds(result.x, result.y).y;
      this.stuckTicks = 0;
      if (result.avoided) this.obstaclesAvoided++;
    } else {
      this.stuckTicks++;
      if (this.stuckTicks > 6 && this.waypointIndex < this.path.length - 1) {
        this.waypointIndex++;
        this.targetX = this.path[this.waypointIndex].x;
        this.targetY = this.path[this.waypointIndex].y;
        this.stuckTicks = 0;
      }
    }

    this.trail.push({ x: this.x, y: this.y, age: 0 });
    if (this.trail.length > this.maxTrail) this.trail.shift();
    this.trail.forEach((t) => t.age++);
  }

  atTarget(threshold = 1.2) {
    if (!this.path || this.path.length === 0) return false;
    const last = this.path[this.path.length - 1];
    return Utils.dist(this.x, this.y, last.x, last.y) < threshold;
  }
}
