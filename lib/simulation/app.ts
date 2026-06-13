// lib/simulation/app.ts
import { CONFIG, ROBOT_DEFS, Utils } from "./config";
import { World } from "./world";
import { Robot, PathSimulator } from "./entities";
import { MapRenderer, NeuralVisualizer } from "./renderers";

export type SimulationState = {
  robot: { battery: number; speed: number; temperature: number; cpu: number };
  mission: {
    survivors: number;
    saved: number;
    safeZone: number;
    riskZone: number;
    criticalZone: number;
    obstaclesAvoided: number;
    efficiency: number;
  };
  sensors: Array<{
    name: string;
    value: number;
    unit: string;
    status: string;
    max: number;
  }>;
  logs: Array<{ text: string; type: string; time: string; id: string }>;
  alert: { text: string; level: string };
  statusString: string;
};

export class AppController {
  world: World;
  robots: Robot[];
  simCanvas: HTMLCanvasElement;
  neuralCanvas: HTMLCanvasElement | null;
  mapRenderer: MapRenderer;
  neuralViz: NeuralVisualizer | null = null;

  onStateUpdate: (state: SimulationState) => void;
  state: SimulationState;

  animationFrameId: number | null = null;
  tickIntervalId: NodeJS.Timeout | null = null;
  missionSeconds = 0;

  // Store the bound function so we can remove it later
  private handleAftershockEvent = () => this.triggerAftershock();

  constructor(
    simCanvas: HTMLCanvasElement,
    neuralCanvas: HTMLCanvasElement | null,
    onStateUpdate: (state: SimulationState) => void,
  ) {
    this.simCanvas = simCanvas;
    this.neuralCanvas = neuralCanvas;
    this.onStateUpdate = onStateUpdate;

    this.world = new World(CONFIG.gridCols, CONFIG.gridRows);

    const spawns: any[] = [];
    this.robots = ROBOT_DEFS.map((def, i) => {
      const spawn = this.world.getSafeSpawn(spawns);
      spawns.push(spawn);
      const robot = new Robot(spawn.x, spawn.y, def, i);
      robot.pathSimulator = new PathSimulator(this.world);
      return robot;
    });

    this.mapRenderer = new MapRenderer(this.simCanvas, this.world, this.robots);
    if (this.neuralCanvas) {
      this.neuralViz = new NeuralVisualizer(this.neuralCanvas);
    }

    // Initialize clean state object
    this.state = {
      robot: { battery: 87, speed: 1.4, temperature: 42, cpu: 34 },
      mission: {
        survivors: 12,
        saved: 3,
        safeZone: 4,
        riskZone: 3,
        criticalZone: 2,
        obstaclesAvoided: 0,
        efficiency: 76,
      },
      sensors: [
        {
          name: "Proximity Sensor",
          value: 2.4,
          unit: "m",
          status: "safe",
          max: 5,
        },
        {
          name: "Thermal Sensor",
          value: 36.8,
          unit: "°C",
          status: "safe",
          max: 80,
        },
        {
          name: "Gas Sensor",
          value: 12,
          unit: "ppm",
          status: "safe",
          max: 100,
        },
        {
          name: "LiDAR Status",
          value: 98,
          unit: "%",
          status: "safe",
          max: 100,
        },
        {
          name: "Crack Width Scanner",
          value: 0.3,
          unit: "m",
          status: "safe",
          max: 3,
        },
      ],
      logs: [],
      alert: {
        text: "All systems nominal — monitoring active",
        level: "normal",
      },
      statusString: "Scanning systems...",
    };

    // Listen for the custom event triggered by the UI button
    window.addEventListener("triggerAftershock", this.handleAftershockEvent);

    this._init();
  }

  addLog(text: string, type: string = "") {
    this.state.logs.unshift({
      text,
      type,
      time: Utils.nowTimeStr(),
      id: Math.random().toString(36).substr(2, 9),
    });
    if (this.state.logs.length > 20) this.state.logs.pop();
  }

  setAlert(text: string, level: string) {
    this.state.alert = { text, level };
  }

  triggerAftershock() {
    this.addLog(
      "CRITICAL: Aftershock detected! New debris falling.",
      "critical",
    );
    this.setAlert("AFTERSHOCK: Rerouting all active robots", "critical");

    // Drop 15 random obstacles onto the grid
    for (let i = 0; i < 15; i++) {
      const dropX = Math.floor(Utils.rand(5, this.world.cols - 5));
      const dropY = Math.floor(Utils.rand(5, this.world.rows - 5));
      this.world.avoidableObstacles.add(`${dropX},${dropY}`);
    }

    if (this.neuralViz) this.neuralViz.triggerPulse();

    // Force robots to recalculate paths using the Backend immediately
    this.robots.forEach((robot) => {
      robot.stuckTicks = 100;
    });
  }

  _init() {
    this.addLog("NeuroRescue systems online — mission initiated", "success");
    this._recalculatePaths();

    // Start Loops
    this.tickIntervalId = setInterval(() => this._tick(), CONFIG.tickInterval);

    const loop = (time: number) => {
      this.robots.forEach((robot) => {
        robot.update(this.world);
        // If stuck, ask pathSimulator to compute route
        if (robot.stuckTicks > 10) {
          robot
            .pathSimulator!.computeRouteWithBackend(
              robot.x,
              robot.y,
              robot.pathSimulator!.targetSurvivor,
            )
            .then((confidence) => {
              if (confidence) {
                this.addLog(
                  `Neural Backend Rerouted. Confidence: ${confidence}%`,
                  "success",
                );
              }
              robot.setPath(robot.pathSimulator!.waypoints);
              robot.stuckTicks = 0;
            });
        }
      });

      this.mapRenderer.render(time);
      if (this.neuralViz) this.neuralViz.render(time);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  _recalculatePaths() {
    const statusParts: string[] = [];
    this.robots.forEach((robot) => {
      // Use local compute route initially, backend will take over if they get stuck or aftershock hits
      robot.pathSimulator!.computeRoute(
        robot.x,
        robot.y,
        robot.robotIndex,
        CONFIG.robotCount,
      );
      robot.setPath(robot.pathSimulator!.waypoints);
      robot.stuckTicks = 0;

      const target = robot.pathSimulator!.targetSurvivor;
      if (target) {
        target.scanned = true;
        statusParts.push(`${robot.name}→#${target.id}`);
      } else {
        statusParts.push(`${robot.name}: idle`);
      }
    });
    this.state.statusString = statusParts.length
      ? statusParts.join("  |  ")
      : "All robots: mission complete";
  }

  _tick() {
    let rescuedThisTick = false;
    this.robots.forEach((robot) => {
      const target = robot.pathSimulator!.targetSurvivor;
      if (target && !target.rescued && !target.abandoned && robot.atTarget()) {
        target.rescued = true;
        rescuedThisTick = true;
        this.addLog(
          `${robot.name} rescue completed — Survivor #${target.id} evacuated`,
          "success",
        );
        if (this.neuralViz) this.neuralViz.triggerPulse();
      }
    });

    if (rescuedThisTick) this._recalculatePaths();

    const totalAvoided = this.robots.reduce(
      (sum, r) => sum + r.obstaclesAvoided,
      0,
    );
    this.state.mission.obstaclesAvoided = totalAvoided;

    // Simulating Telemetry updates
    this.state.robot.battery = Utils.clamp(
      this.state.robot.battery - Utils.rand(0, 0.3),
      15,
      100,
    );
    this.state.robot.speed = Utils.clamp(
      this.state.robot.speed + Utils.rand(-0.15, 0.15),
      0.4,
      2.2,
    );
    this.state.robot.temperature = Utils.clamp(
      this.state.robot.temperature + Utils.rand(-1, 1.5),
      35,
      65,
    );
    this.state.robot.cpu = Utils.clamp(
      this.state.robot.cpu + Utils.rand(-5, 8),
      15,
      95,
    );

    const pending = this.world.survivors.filter(
      (s) => !s.rescued && !s.abandoned,
    );
    this.state.mission.survivors = this.world.survivors.filter(
      (s) => !s.abandoned,
    ).length;
    this.state.mission.saved = this.world.survivors.filter(
      (s) => s.rescued,
    ).length;
    this.state.mission.safeZone = pending.filter(
      (s) => s.zone === "safe",
    ).length;
    this.state.mission.riskZone = pending.filter(
      (s) => s.zone === "risk",
    ).length;
    this.state.mission.criticalZone = pending.filter(
      (s) => s.zone === "critical",
    ).length;

    // Broadcast state to React
    this.onStateUpdate({ ...this.state });
  }

  destroy() {
    window.removeEventListener("triggerAftershock", this.handleAftershockEvent);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.tickIntervalId) clearInterval(this.tickIntervalId);
  }
}
