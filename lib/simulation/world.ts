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

    // --> PASTE YOUR GENERATION METHODS HERE FROM SCRIPT.JS <--
    // _generateOrganicRoads(), _generateParks(), _generateNaturalArchitecture(),
    // _generateCollapsedSites(), _generateDebrisAndObstacles(), _generateGroundCracks(),
    // _generateDangerZones(), _generateSurvivors(), _buildObstacleMaps()
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

  // Paste all your helper methods: isInBounds, clampToBounds, isWalkable, canTraverse,
  // findNearestWalkableCell, findNearestWalkable, findPathBFS, getSafeSpawn,
  // getTerrainSpeedMultiplier, isNearAvoidableObstacle, etc.

  _generateOrganicRoads() {
    /* ... */
  }
  _generateParks() {
    /* ... */
  }
  _generateNaturalArchitecture() {
    /* ... */
  }
  _generateCollapsedSites() {
    /* ... */
  }
  _generateDebrisAndObstacles() {
    /* ... */
  }
  _generateGroundCracks() {
    /* ... */
  }
  _generateDangerZones() {
    /* ... */
  }
  _generateSurvivors() {
    /* ... */
  }
  _buildObstacleMaps() {
    /* ... */
  }
  _isInsideBuilding(x: number, y: number) {
    return false; /* ... */
  }
  _canPlaceObstacle(x: number, y: number) {
    return true; /* ... */
  }
  _addAvoidableObstacle(x: number, y: number) {
    /* ... */
  }
  _purgeObstaclesFromBuildings() {
    /* ... */
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
    // Paste findPathBFS logic
    return [];
  }
  getSafeSpawn(usedPositions: any[] = []) {
    return { x: 2.5, y: 2.5 }; // Paste getSafeSpawn logic
  }
  getTerrainSpeedMultiplier(x: number, y: number) {
    return 1; // Paste getTerrainSpeedMultiplier logic
  }
  isNearAvoidableObstacle(x: number, y: number, radius = 1.2) {
    return false; // Paste isNearAvoidableObstacle logic
  }
}
