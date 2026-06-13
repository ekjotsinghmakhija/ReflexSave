from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import networkx as nx

app = FastAPI(title="NeuroRescue Adaptive Core")

# Allow Next.js frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class GridState(BaseModel):
    cols: int
    rows: int
    robot_x: int
    robot_y: int
    target_x: int
    target_y: int
    obstacles: list[str]  # e.g. ["10,12", "11,12"]
    danger_cracks: list[str]

@app.post("/api/calculate-path")
async def calculate_neuromorphic_path(state: GridState):
    """
    Adaptive Pathfinding: Processes the grid and returns waypoints.
    Treats obstacles as solid walls and danger cracks as high-cost terrain.
    """
    G = nx.grid_2d_graph(state.cols, state.rows)

    # Process obstacles (impassable)
    obstacle_set = set()
    for obs in state.obstacles:
        x, y = map(int, obs.split(","))
        obstacle_set.add((x, y))
        if (x, y) in G:
            G.remove_node((x, y))

    # Process danger cracks (passable but heavily penalized)
    danger_set = set()
    for crack in state.danger_cracks:
        x, y = map(int, crack.split(","))
        danger_set.add((x, y))

    # Assign dynamic neural weights to edges
    for u, v in G.edges():
        weight = 1.0
        # If moving into a danger zone, massively increase the cost
        if v in danger_set or u in danger_set:
            weight = 50.0  # The AI will naturally avoid this unless absolutely necessary
        G[u][v]['weight'] = weight

    start = (int(state.robot_x), int(state.robot_y))
    target = (int(state.target_x), int(state.target_y))

    # Nearest valid nodes if standing on an obstacle (edge case)
    if start not in G:
        start = min(G.nodes, key=lambda n: (n[0]-start[0])**2 + (n[1]-start[1])**2)
    if target not in G:
        target = min(G.nodes, key=lambda n: (n[0]-target[0])**2 + (n[1]-target[1])**2)

    try:
        # A* Search simulating the neural cascade
        path = nx.astar_path(G, start, target, weight='weight')
        # Convert path tuples back to objects for TypeScript
        waypoints = [{"x": p[0] + 0.5, "y": p[1] + 0.5} for p in path]

        # Calculate confidence based on path cost
        path_length = nx.astar_path_length(G, start, target, weight='weight')
        confidence = max(40.0, 100.0 - (path_length * 0.5))

        return {
            "status": "success",
            "confidence": round(confidence, 1),
            "waypoints": waypoints
        }
    except nx.NetworkXNoPath:
        return {"status": "failed", "message": "No safe path found."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
