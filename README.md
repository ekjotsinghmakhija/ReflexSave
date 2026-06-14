# ReflexSave: Neuromorphic Swarm Rescue System

> **Official Hackathon Submission: Disaster Zone Adaptive Navigation**

ReflexSave is a hybrid AI swarm simulation designed for dynamic disaster response. Powered by a **Next.js** frontend and a **PyTorch/FastAPI** backend, the system deploys a fleet of autonomous rescue robots that use neuromorphic terrain evaluation to navigate collapsed structures, dynamic ground cracks, and unpredictable aftershocks.

## Core Features

* **PyTorch Neuromorphic Backend:** A neural network (`NeuromorphicTerrainNet`) dynamically assigns traversal weights to terrain based on danger proximity and physical obstacle density.
* **Swarm Intelligence:** Robots share pathing data in real-time. If one robot detects a blocked path, the entire swarm recalibrates instantly.
* **Physics-Based Server Telemetry:** Battery drain, CPU load, and temperature aren't random—they are calculated server-side based on the physical terrain complexity the robots are crossing.
* **"God Mode" Canvas Injection:** An interactive React canvas that allows users to click and drop concrete debris directly into a robot's path, triggering sub-50ms neural rerouting.
* **Smart Hardware Fallback:** Engineered to detect next-gen GPU architectures (like the RTX 50-series Blackwell) and gracefully fallback to high-speed CPU tensors if the instruction set exceeds stable PyTorch kernels.

## Technology Stack

* **Frontend:** Next.js (App Router), React 18, Tailwind CSS v4, HTML5 Canvas API.
* **Backend:** Python, FastAPI, Uvicorn.
* **AI & Graph Engine:** PyTorch, NetworkX, NumPy.
* **Testing:** Vitest (Frontend Engine), Pytest (Backend Telemetry & Routing).

## How to Run Locally

You will need two terminal windows to run the Hybrid Architecture.

**1. Start the Neuromorphic Backend:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

**2. Start the Frontend Swarm Dashboard:**
```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Running the Test Suites

This project includes automated testing for both the physics engine and the AI routing.

* **Backend Tests:** `cd backend && python -m pytest test_main.py -v`
* **Frontend Tests:** `npm test`

---

## System Architecture & Technical Highlights

ReflexSave operates on a strictly decoupled, high-performance hybrid architecture designed to separate UI rendering from heavy tensor computations:

* **Hybrid Execution Model:** The Next.js client acts purely as a 60FPS physics renderer and state manager. All complex pathfinding, swarm communication, and danger evaluation are offloaded to the Python FastAPI microservice.
* **Deterministic Telemetry Engine:** Unlike standard UI simulations, robot telemetry is fully deterministic. The Python server calculates physical battery drain and CPU thermal throttling by evaluating the exact density of the terrain the robot is currently traversing.
* **Adaptive Rerouting Latency:** The system is designed to handle sudden topological shifts (e.g., unexpected aftershocks). When dynamic debris is injected into the simulation, the PyTorch model evaluates the new terrain graph and propagates updated A* routing instructions back to the swarm in under 50 milliseconds.
* **Intelligent Hardware Acceleration:** The backend features an autonomous hardware probe. It attempts to allocate VRAM on NVIDIA CUDA architectures by default, but utilizes a smart fallback mechanism to push tensors to the CPU if it detects an unsupported, bleeding-edge GPU architecture, ensuring zero runtime crashes during deployment.

---

## Future Roadmap (Beyond the Hackathon)

* **Real-World LiDAR Integration:** Connect the grid coordinate system to incoming point-cloud data from drone hardware.
* **Reinforcement Learning:** Upgrade the NeuromorphicTerrainNet to a Deep Q-Network (DQN) that actively learns from robot battery depletion over time.
* **Multi-Modal Sensor Fusion:** Incorporate real-time gas and thermal sensor mock-data directly into the pathfinding heuristic weights.