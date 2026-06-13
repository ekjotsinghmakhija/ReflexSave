import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import networkx as nx
import torch
import torch.nn as nn

app = FastAPI(title="NeuroRescue Adaptive Swarm Core")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- 1. THE NEUROMORPHIC ML MODEL ---
class NeuromorphicTerrainNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Inputs: [terrain_type (0=safe, 1=debris, 2=crack), distance_to_danger, battery_level]
        self.network = nn.Sequential(
            nn.Linear(3, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
            nn.Sigmoid() # Outputs a danger probability 0.0 - 1.0
        )

    def forward(self, x):
        return self.network(x)

# Initialize the model (mock weights for the simulation)
danger_model = NeuromorphicTerrainNet()
danger_model.eval()

# --- 2. SCHEMAS ---
class GridState(BaseModel):
    cols: int
    rows: int
    robot_x: int
    robot_y: int
    target_x: int
    target_y: int
    obstacles: list[str]
    danger_cracks: list[str]

class TelemetryState(BaseModel):
    battery: float
    cpu: float
    temperature: float
    terrain_complexity: int # number of nearby obstacles

# --- 3. ENDPOINTS ---
@app.post("/api/calculate-path")
async def calculate_neuromorphic_path(state: GridState):
    start_time = time.time()

    G = nx.grid_2d_graph(state.cols, state.rows)
    obstacle_set = {tuple(map(int, obs.split(","))) for obs in state.obstacles}
    danger_set = {tuple(map(int, c.split(","))) for c in state.danger_cracks}

    for obs in obstacle_set:
        if obs in G: G.remove_node(obs)

    # Apply PyTorch Model Weights to the graph
    for u, v in G.edges():
        is_danger = 1.0 if v in danger_set or u in danger_set else 0.0

        # ML Inference for dynamic weight
        with torch.no_grad():
            tensor_input = torch.tensor([[is_danger, 1.0, 100.0]], dtype=torch.float32)
            danger_score = danger_model(tensor_input).item()

        weight = 1.0 + (danger_score * 50.0) # Scale danger
        if is_danger: weight += 100.0 # Strict penalty for cracks

        G[u][v]['weight'] = weight

    start = (int(state.robot_x), int(state.robot_y))
    target = (int(state.target_x), int(state.target_y))

    if start not in G: start = min(G.nodes, key=lambda n: (n[0]-start[0])**2 + (n[1]-start[1])**2)
    if target not in G: target = min(G.nodes, key=lambda n: (n[0]-target[0])**2 + (n[1]-target[1])**2)

    try:
        path = nx.astar_path(G, start, target, weight='weight')
        waypoints = [{"x": p[0] + 0.5, "y": p[1] + 0.5} for p in path]
        path_cost = nx.astar_path_length(G, start, target, weight='weight')
        confidence = max(40.0, 100.0 - (path_cost * 0.2))

        inference_ms = (time.time() - start_time) * 1000

        return {
            "status": "success",
            "confidence": round(confidence, 1),
            "waypoints": waypoints,
            "metrics": {
                "inference_ms": round(inference_ms, 2),
                "compute_tokens": len(G.nodes) # Mock cost metric
            }
        }
    except nx.NetworkXNoPath:
        return {"status": "failed", "message": "No safe path found."}

@app.post("/api/telemetry")
async def update_telemetry(state: TelemetryState):
    """ Server-side physics calculations for real telemetry """
    drain_multiplier = 1.0 + (state.terrain_complexity * 0.1)

    new_battery = max(15.0, state.battery - (0.05 * drain_multiplier))
    new_cpu = min(95.0, 30.0 + (state.terrain_complexity * 12.0) + np.random.normal(0, 2))
    new_temp = min(85.0, state.temperature + (0.1 * drain_multiplier) if state.cpu > 60 else state.temperature - 0.1)

    return {
        "battery": round(new_battery, 2),
        "cpu": round(new_cpu, 1),
        "temperature": round(new_temp, 1)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
