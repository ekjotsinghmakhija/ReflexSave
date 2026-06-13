// lib/simulation/world.ts
import { Utils } from "./config";

export class World {
  cols: number;
  rows: number;
  tiles: number[][];
  buildingStructures: any[];
  buildingFootprints: any[];
  collapsed: any[];
  debrisZones: any[];
  vehicleDebris: any[];
  buildingDebris: any[];
  cracks: any[];
  dangerZones: any[];
  parks: any[];
  roads: any[];
  survivors: any[];
  obstacles: Set<string>;
  avoidableObstacles: Set<string>;
  dangerCrackCells: Set<string>;
  cautionCrackCells: Set<string>;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.tiles = [];
    this.buildingStructures = [];
    this.buildingFootprints = [];
    this.collapsed = [];
    this.debrisZones = [];
    this.vehicleDebris = [];
    this.buildingDebris = [];
    this.cracks = [];
    this.dangerZones = [];
    this.parks = [];
    this.roads = [];
    this.survivors = [];
    this.obstacles = new Set();
    this.avoidableObstacles = new Set();
    this.dangerCrackCells = new Set();
    this.cautionCrackCells = new Set();

    this.generate();
  }

  generate() {
    for (let y = 0; y < this.rows; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.tiles[y][x] = 0;
      }
    }

    this._generateOrganicRoads();
    this._generateParks();
    this._generateNaturalArchitecture();
    this._generateCollapsedSites();
    this._generateDebrisAndObstacles();
    this._generateGroundCracks();
    this._generateDangerZones();
    this._generateSurvivors();
    this._buildObstacleMaps();
  }

  _generateOrganicRoads() {
    const setRoad = (x: number, y: number) => {
      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        if (this.tiles[y][x] !== 8) this.tiles[y][x] = 1;
        this.roads.push({ x, y });
      }
    };

    const drawRoadLine = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      width = 2,
    ) => {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = Math.round(Utils.lerp(x0, x1, t));
        const cy = Math.round(Utils.lerp(y0, y1, t));
        for (let w = 0; w < width; w++) {
          setRoad(cx + w, cy);
          setRoad(cx, cy + w);
        }
      }
    };

    [5, 12, 20, 28, 35].forEach((y) => {
      for (let x = 2; x < this.cols - 2; x++) {
        setRoad(x, y);
        setRoad(x, y + 1);
      }
    });

    [6, 16, 26, 36, 48].forEach((x) => {
      for (let y = 2; y < this.rows - 2; y++) {
        setRoad(x, y);
        setRoad(x + 1, y);
      }
    });

    drawRoadLine(6, 12, 16, 20, 1);
    drawRoadLine(26, 8, 36, 16, 1);
    drawRoadLine(16, 28, 26, 35, 1);
    drawRoadLine(36, 22, 48, 30, 1);
    drawRoadLine(6, 28, 16, 35, 1);

    for (let y = 18; y <= 24; y++) {
      for (let x = 22; x <= 30; x++) {
        setRoad(x, y);
      }
    }
  }

  _generateParks() {
    const parkAreas = [
      { x: 38, y: 4, w: 5, h: 4 },
      { x: 8, y: 32, w: 6, h: 5 },
      { x: 44, y: 32, w: 4, h: 4 },
    ];
    parkAreas.forEach((p) => {
      this.parks.push(p);
      for (let dy = 0; dy < p.h; dy++) {
        for (let dx = 0; dx < p.w; dx++) {
          const tx = p.x + dx;
          const ty = p.y + dy;
          if (tx < this.cols && ty < this.rows && this.tiles[ty][tx] === 0) {
            this.tiles[ty][tx] = 8;
          }
        }
      }
    });
  }

  _generateNaturalArchitecture() {
    const structures = [
      { type: "shop", x: 8, y: 6, w: 3, h: 2, roof: "flat", intact: true },
      { type: "shop", x: 11, y: 6, w: 4, h: 2, roof: "flat", intact: true },
      { type: "shop", x: 18, y: 6, w: 3, h: 2, roof: "flat", intact: false },
      {
        type: "residential",
        x: 22,
        y: 6,
        w: 3,
        h: 3,
        roof: "terrace",
        intact: true,
      },
      {
        type: "apartment",
        x: 28,
        y: 6,
        w: 5,
        h: 5,
        roof: "flat",
        intact: true,
      },
      { type: "shop", x: 38, y: 6, w: 4, h: 2, roof: "flat", intact: true },
      {
        type: "residential",
        x: 44,
        y: 6,
        w: 3,
        h: 3,
        roof: "terrace",
        intact: true,
      },
      {
        type: "residential",
        x: 50,
        y: 10,
        w: 3,
        h: 4,
        roof: "terrace",
        intact: true,
      },
      {
        type: "residential",
        x: 50,
        y: 15,
        w: 4,
        h: 3,
        roof: "terrace",
        intact: false,
      },
      {
        type: "compound",
        x: 38,
        y: 14,
        w: 5,
        h: 4,
        roof: "courtyard",
        intact: true,
      },
      {
        type: "apartment",
        x: 44,
        y: 14,
        w: 4,
        h: 6,
        roof: "flat",
        intact: true,
      },
      { type: "temple", x: 8, y: 14, w: 4, h: 4, roof: "dome", intact: true },
      {
        type: "residential",
        x: 13,
        y: 14,
        w: 2,
        h: 3,
        roof: "terrace",
        intact: true,
      },
      { type: "shop", x: 8, y: 18, w: 3, h: 2, roof: "flat", intact: false },
      {
        type: "residential",
        x: 13,
        y: 18,
        w: 2,
        h: 2,
        roof: "terrace",
        intact: true,
      },
      { type: "shop", x: 18, y: 14, w: 3, h: 2, roof: "flat", intact: true },
      { type: "shop", x: 18, y: 16, w: 2, h: 2, roof: "flat", intact: true },
      {
        type: "apartment",
        x: 32,
        y: 14,
        w: 3,
        h: 5,
        roof: "flat",
        intact: true,
      },
      {
        type: "residential",
        x: 32,
        y: 20,
        w: 3,
        h: 3,
        roof: "terrace",
        intact: false,
      },
      {
        type: "apartment",
        x: 8,
        y: 22,
        w: 5,
        h: 5,
        roof: "flat",
        intact: true,
      },
      {
        type: "residential",
        x: 14,
        y: 22,
        w: 2,
        h: 4,
        roof: "terrace",
        intact: true,
      },
      {
        type: "compound",
        x: 18,
        y: 22,
        w: 6,
        h: 5,
        roof: "courtyard",
        intact: false,
      },
      { type: "shop", x: 28, y: 22, w: 3, h: 2, roof: "flat", intact: true },
      {
        type: "apartment",
        x: 32,
        y: 22,
        w: 4,
        h: 6,
        roof: "flat",
        intact: true,
      },
      {
        type: "residential",
        x: 38,
        y: 22,
        w: 3,
        h: 3,
        roof: "terrace",
        intact: true,
      },
      {
        type: "residential",
        x: 8,
        y: 30,
        w: 4,
        h: 3,
        roof: "terrace",
        intact: true,
      },
      { type: "shop", x: 14, y: 30, w: 2, h: 2, roof: "flat", intact: false },
      {
        type: "apartment",
        x: 18,
        y: 30,
        w: 5,
        h: 4,
        roof: "flat",
        intact: true,
      },
      {
        type: "residential",
        x: 28,
        y: 30,
        w: 3,
        h: 3,
        roof: "terrace",
        intact: true,
      },
      {
        type: "compound",
        x: 33,
        y: 30,
        w: 5,
        h: 4,
        roof: "courtyard",
        intact: true,
      },
      {
        type: "apartment",
        x: 44,
        y: 28,
        w: 4,
        h: 5,
        roof: "flat",
        intact: false,
      },
      {
        type: "residential",
        x: 50,
        y: 28,
        w: 3,
        h: 4,
        roof: "terrace",
        intact: true,
      },
      {
        type: "residential",
        x: 3,
        y: 8,
        w: 2,
        h: 3,
        roof: "terrace",
        intact: true,
      },
      { type: "shop", x: 3, y: 12, w: 2, h: 2, roof: "flat", intact: true },
      {
        type: "apartment",
        x: 28,
        y: 36,
        w: 4,
        h: 4,
        roof: "flat",
        intact: true,
      },
      {
        type: "residential",
        x: 18,
        y: 36,
        w: 3,
        h: 3,
        roof: "terrace",
        intact: true,
      },
      { type: "shop", x: 44, y: 36, w: 3, h: 2, roof: "flat", intact: true },
    ];

    structures.forEach((s) => this._stampBuilding(s));
  }

  _stampBuilding(s: any) {
    const cells = [];
    for (let dy = 0; dy < s.h; dy++) {
      for (let dx = 0; dx < s.w; dx++) {
        const tx = s.x + dx;
        const ty = s.y + dy;
        if (tx >= this.cols || ty >= this.rows) continue;
        if (this.tiles[ty][tx] === 1 || this.tiles[ty][tx] === 8) continue;

        if (s.type === "compound" && s.roof === "courtyard") {
          const innerX = dx >= 1 && dx <= s.w - 2;
          const innerY = dy >= 1 && dy <= s.h - 2;
          if (innerX && innerY) continue;
        }

        if (s.intact) {
          this.tiles[ty][tx] = 2;
          cells.push({ x: tx, y: ty });
        }
      }
    }
    if (cells.length > 0) {
      this.buildingStructures.push({ ...s, cells });
      this.buildingFootprints.push({ x: s.x, y: s.y, w: s.w, h: s.h });
    }
  }

  _isInsideBuilding(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return false;
    if (this.tiles[y][x] === 2) return true;
    for (const fp of this.buildingFootprints) {
      if (x >= fp.x && x < fp.x + fp.w && y >= fp.y && y < fp.y + fp.h) {
        if (this.tiles[y][x] === 3) return false;
        return true;
      }
    }
    return false;
  }

  _canPlaceObstacle(x: number, y: number) {
    if (this._isInsideBuilding(x, y)) return false;
    const tile = this.tiles[y][x];
    return (
      [0, 1, 4].includes(tile) && !this.avoidableObstacles.has(`${x},${y}`)
    );
  }

  _purgeObstaclesFromBuildings() {
    for (const key of Array.from(this.avoidableObstacles)) {
      const [x, y] = key.split(",").map(Number);
      if (this._isInsideBuilding(x, y)) this.avoidableObstacles.delete(key);
    }
    this.vehicleDebris = this.vehicleDebris.filter(
      (d) => !this._isInsideBuilding(d.x, d.y),
    );
    this.buildingDebris = this.buildingDebris.filter(
      (d) => !this._isInsideBuilding(d.x, d.y),
    );
  }

  _generateCollapsedSites() {
    const sites = [
      { x: 18, y: 6, w: 3, h: 2 },
      { x: 38, y: 14, w: 4, h: 3 },
      { x: 12, y: 18, w: 3, h: 3 },
      { x: 20, y: 22, w: 5, h: 4 },
      { x: 32, y: 20, w: 3, h: 3 },
      { x: 44, y: 28, w: 4, h: 3 },
      { x: 14, y: 30, w: 3, h: 2 },
      { x: 50, y: 15, w: 3, h: 2 },
    ];

    sites.forEach((c) => {
      this.collapsed.push({ ...c });
      for (let dy = 0; dy < c.h; dy++) {
        for (let dx = 0; dx < c.w; dx++) {
          const tx = c.x + dx;
          const ty = c.y + dy;
          if (tx < this.cols && ty < this.rows) {
            this.tiles[ty][tx] = 3;
          }
        }
      }
    });
  }

  _generateDebrisAndObstacles() {
    const zones = [
      { x: 10, y: 10, w: 4, h: 3 },
      { x: 24, y: 10, w: 3, h: 2 },
      { x: 40, y: 10, w: 3, h: 3 },
      { x: 14, y: 24, w: 4, h: 2 },
      { x: 28, y: 26, w: 3, h: 3 },
      { x: 42, y: 20, w: 3, h: 2 },
      { x: 20, y: 32, w: 4, h: 2 },
      { x: 36, y: 34, w: 3, h: 2 },
    ];

    zones.forEach((z) => {
      this.debrisZones.push(z);
      for (let dy = 0; dy < z.h; dy++) {
        for (let dx = 0; dx < z.w; dx++) {
          const tx = z.x + dx;
          const ty = z.y + dy;
          if (
            tx < this.cols &&
            ty < this.rows &&
            [0, 1].includes(this.tiles[ty][tx])
          ) {
            this.tiles[ty][tx] = 4;
          }
        }
      }
    });

    const vehicleTypes = ["car", "tire", "metal", "bike"];
    let placed = 0;
    let attempts = 0;
    while (placed < 45 && attempts < 400) {
      attempts++;
      const x = Utils.randInt(2, this.cols - 3);
      const y = Utils.randInt(2, this.rows - 3);
      if (!this._canPlaceObstacle(x, y)) continue;

      this.vehicleDebris.push({
        x,
        y,
        type: vehicleTypes[Utils.randInt(0, 3)],
        rotation: Utils.rand(0, Math.PI * 2),
        scale: Utils.rand(0.65, 1.25),
      });
      this._addAvoidableObstacle(x, y);
      placed++;
    }

    const debrisTypes = ["slab", "brick", "rod", "glass", "wall"];
    this.collapsed.forEach((c) => {
      for (let i = 0; i < 12; i++) {
        const bx = Utils.clamp(
          Math.round(c.x + Utils.rand(-1, c.w)),
          1,
          this.cols - 2,
        );
        const by = Utils.clamp(
          Math.round(c.y + Utils.rand(-1, c.h)),
          1,
          this.rows - 2,
        );
        if (this._isInsideBuilding(bx, by)) continue;
        if (this.tiles[by][bx] === 3 || this.tiles[by][bx] === 4) {
          this.buildingDebris.push({
            x: bx,
            y: by,
            type: debrisTypes[Utils.randInt(0, 4)],
            rotation: Utils.rand(0, Math.PI * 2),
          });
          this._addAvoidableObstacle(bx, by);
        }
      }
    });

    for (let i = 0; i < 25; i++) {
      const x = Utils.randInt(3, this.cols - 4);
      const y = Utils.randInt(3, this.rows - 4);
      if (!this._canPlaceObstacle(x, y)) continue;
      this.buildingDebris.push({
        x,
        y,
        type: debrisTypes[Utils.randInt(0, 4)],
        rotation: Utils.rand(0, Math.PI * 2),
      });
      this._addAvoidableObstacle(x, y);
    }
    this._purgeObstaclesFromBuildings();
  }

  _addAvoidableObstacle(x: number, y: number) {
    this.avoidableObstacles.add(`${x},${y}`);
  }

  _generateGroundCracks() {
    const crackPaths = [
      {
        path: [
          [8, 14],
          [10, 15],
          [12, 14],
          [14, 16],
          [16, 15],
        ],
        width: 0.35,
      },
      {
        path: [
          [20, 8],
          [22, 10],
          [24, 11],
          [26, 10],
        ],
        width: 0.45,
      },
      {
        path: [
          [30, 12],
          [32, 14],
          [34, 15],
          [36, 14],
          [38, 16],
        ],
        width: 0.9,
      },
      {
        path: [
          [42, 8],
          [44, 10],
          [46, 12],
        ],
        width: 1.1,
      },
      {
        path: [
          [10, 22],
          [12, 24],
          [14, 23],
          [16, 25],
        ],
        width: 0.3,
      },
      {
        path: [
          [22, 18],
          [24, 20],
          [26, 22],
          [28, 21],
        ],
        width: 1.3,
      },
      {
        path: [
          [34, 24],
          [36, 26],
          [38, 28],
        ],
        width: 2.1,
      },
      {
        path: [
          [44, 18],
          [46, 20],
          [48, 22],
          [50, 21],
        ],
        width: 1.7,
      },
      {
        path: [
          [6, 30],
          [8, 32],
          [10, 31],
          [12, 33],
        ],
        width: 0.55,
      },
      {
        path: [
          [28, 32],
          [30, 34],
          [32, 33],
          [34, 35],
        ],
        width: 0.8,
      },
      {
        path: [
          [18, 34],
          [20, 36],
          [22, 35],
        ],
        width: 0.4,
      },
      {
        path: [
          [40, 32],
          [42, 34],
          [44, 33],
          [46, 35],
        ],
        width: 1.9,
      },
    ];

    this.cracks = crackPaths.map((def) => {
      const type =
        def.width < 0.5 ? "safe" : def.width <= 1.5 ? "caution" : "danger";
      const color =
        type === "safe"
          ? "#00e676"
          : type === "caution"
            ? "#ffd23f"
            : "#ff3b5c";
      const points = def.path.map(([px, py]) => ({
        gx: px,
        gy: py,
        jx: Utils.rand(-0.15, 0.15),
        jy: Utils.rand(-0.15, 0.15),
      }));
      return { width: def.width, type, color, points };
    });
  }

  _generateDangerZones() {
    this.dangerZones = [
      { x: 20, y: 22, r: 3 },
      { x: 38, y: 14, r: 2.5 },
      { x: 44, y: 28, r: 2.8 },
      { x: 12, y: 18, r: 2 },
      { x: 34, y: 26, r: 2.2 },
    ];
  }

  _generateSurvivors() {
    const positions = [
      { x: 10, y: 8, zone: "safe" },
      { x: 24, y: 8, zone: "risk" },
      { x: 40, y: 8, zone: "critical" },
      { x: 10, y: 15, zone: "safe" },
      { x: 20, y: 19, zone: "risk" },
      { x: 29, y: 7, zone: "critical" },
      { x: 46, y: 12, zone: "risk" },
      { x: 9, y: 24, zone: "safe" },
      { x: 16, y: 26, zone: "critical" },
      { x: 30, y: 24, zone: "risk" },
      { x: 40, y: 24, zone: "safe" },
      { x: 24, y: 32, zone: "critical" },
      { x: 34, y: 32, zone: "risk" },
      { x: 48, y: 32, zone: "safe" },
      { x: 14, y: 34, zone: "critical" },
      { x: 11, y: 7, zone: "critical" },
      { x: 33, y: 15, zone: "critical" },
      { x: 21, y: 23, zone: "critical" },
    ];

    this.survivors = positions.map((p, i) => ({
      id: i + 1,
      x: p.x + 0.5,
      y: p.y + 0.5,
      zone: p.zone,
      rescued: false,
      abandoned: false,
      scanned: false,
      pulse: Utils.rand(0, Math.PI * 2),
    }));
  }

  _buildObstacleMaps() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.tiles[y][x];
        if (t === 2 || t === 3 || t === 5) {
          this.obstacles.add(`${x},${y}`);
        }
      }
    }

    this.cracks.forEach((crack) => {
      crack.points.forEach((pt: any) => {
        const key = `${Math.round(pt.gx)},${Math.round(pt.gy)}`;
        if (crack.type === "danger") {
          this.dangerCrackCells.add(key);
          this.obstacles.add(key);
        } else if (crack.type === "caution") {
          this.cautionCrackCells.add(key);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              this.cautionCrackCells.add(
                `${Math.round(pt.gx) + dx},${Math.round(pt.gy) + dy}`,
              );
            }
          }
        }
      });
    });
  }

  isInBounds(x: number, y: number) {
    return x >= 0.5 && y >= 0.5 && x <= this.cols - 0.5 && y <= this.rows - 0.5;
  }

  clampToBounds(x: number, y: number) {
    return {
      x: Utils.clamp(x, 0.5, this.cols - 0.5),
      y: Utils.clamp(y, 0.5, this.rows - 0.5),
    };
  }

  isWalkable(x: number, y: number) {
    const ix = Math.floor(x + 0.5);
    const iy = Math.floor(y + 0.5);
    if (!this.isInBounds(ix + 0.5, iy + 0.5)) return false;
    const key = `${ix},${iy}`;
    if (this.avoidableObstacles.has(key)) return false;
    if (this.dangerCrackCells.has(key)) return false;
    return true;
  }

  canTraverse(x0: number, y0: number, x1: number, y1: number) {
    if (!this.isWalkable(x1, y1)) return false;
    const dist = Utils.dist(x0, y0, x1, y1);
    const steps = Math.max(4, Math.ceil(dist * 5));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (!this.isWalkable(Utils.lerp(x0, x1, t), Utils.lerp(y0, y1, t)))
        return false;
    }
    return true;
  }

  findNearestWalkableCell(gx: number, gy: number, maxRadius = 12) {
    const ix = Math.floor(gx + 0.5);
    const iy = Math.floor(gy + 0.5);
    if (this.isWalkable(ix, iy)) return { x: ix, y: iy };
    for (let r = 1; r <= maxRadius; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = ix + dx;
          const ny = iy + dy;
          if (this.isWalkable(nx, ny)) return { x: nx, y: ny };
        }
      }
    }
    return { x: ix, y: iy };
  }

  findNearestWalkable(x: number, y: number) {
    const cell = this.findNearestWalkableCell(x, y, 12);
    return { x: cell.x + 0.5, y: cell.y + 0.5 };
  }

  findPathBFS(startX: number, startY: number, endX: number, endY: number) {
    let sx = Math.floor(startX + 0.5);
    let sy = Math.floor(startY + 0.5);
    let ex = Math.floor(endX + 0.5);
    let ey = Math.floor(endY + 0.5);

    if (!this.isWalkable(sx, sy)) {
      const near = this.findNearestWalkableCell(sx, sy, 10);
      sx = near.x;
      sy = near.y;
    }
    if (!this.isWalkable(ex, ey)) {
      const near = this.findNearestWalkableCell(ex, ey, 10);
      ex = near.x;
      ey = near.y;
    }

    const key = (x: number, y: number) => `${x},${y}`;
    const startKey = key(sx, sy);
    const endKey = key(ex, ey);
    const queue = [{ x: sx, y: sy, path: [{ x: sx, y: sy }] }];
    const visited = new Set([startKey]);
    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ];

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (key(node.x, node.y) === endKey) {
        return node.path.map((p) => ({ x: p.x + 0.5, y: p.y + 0.5 }));
      }

      for (const [dx, dy] of dirs) {
        const nx = node.x + dx;
        const ny = node.y + dy;
        const k = key(nx, ny);
        if (visited.has(k) || !this.isWalkable(nx, ny)) continue;
        visited.add(k);
        queue.push({ x: nx, y: ny, path: [...node.path, { x: nx, y: ny }] });
      }
    }
    return null;
  }

  getSafeSpawn(usedPositions: any[] = []) {
    const candidates = this.roads.filter((r) => this.isWalkable(r.x, r.y));
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    for (const pick of shuffled) {
      const pos = { x: pick.x + 0.5, y: pick.y + 0.5 };
      const farEnough = usedPositions.every(
        (u) => Utils.dist(u.x, u.y, pos.x, pos.y) > 5,
      );
      if (farEnough) return pos;
    }
    if (candidates.length === 0) return { x: 2.5, y: 2.5 };
    const pick = candidates[Utils.randInt(0, candidates.length - 1)];
    return { x: pick.x + 0.5, y: pick.y + 0.5 };
  }

  getTerrainSpeedMultiplier(x: number, y: number) {
    const ix = Math.floor(x + 0.5);
    const iy = Math.floor(y + 0.5);
    if (ix < 0 || iy < 0 || ix >= this.cols || iy >= this.rows) return 1;
    const key = `${ix},${iy}`;
    const t = this.tiles[iy][ix];

    if (t === 2) return 0.75;
    if (t === 3) return 0.6;
    if (this.cautionCrackCells.has(key)) return 0.5;
    if (t === 4) return 0.7;
    return 1;
  }

  isNearAvoidableObstacle(x: number, y: number, radius = 1.2) {
    for (const key of Array.from(this.avoidableObstacles)) {
      const [ox, oy] = key.split(",").map(Number);
      if (Utils.dist(x, y, ox, oy) < radius) return true;
    }
    return false;
  }
}
