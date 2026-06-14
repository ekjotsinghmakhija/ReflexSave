import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_telemetry_normal_drain():
    """Test that physics engine correctly calculates battery drain without crashing"""
    response = client.post("/api/telemetry", json={
        "battery": 100.0,
        "cpu": 40.0,
        "temperature": 45.0,
        "terrain_complexity": 0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["battery"] < 100.0  # Battery should drain
    assert data["cpu"] >= 30.0      # CPU should stabilize

def test_telemetry_extreme_stress():
    """Edge Case: Test system under maximum terrain complexity"""
    response = client.post("/api/telemetry", json={
        "battery": 20.0,
        "cpu": 90.0,
        "temperature": 80.0,
        "terrain_complexity": 50
    })
    assert response.status_code == 200
    data = response.json()
    assert data["battery"] >= 15.0  # Battery should never drop below absolute minimum 15%
    assert data["cpu"] <= 95.0      # CPU should throttle and not exceed 95%

def test_pathfinding_valid_route():
    """Test the PyTorch model and A* algorithm with a standard grid"""
    payload = {
        "cols": 20, "rows": 20,
        "robot_x": 1, "robot_y": 1,
        "target_x": 18, "target_y": 18,
        "obstacles": ["5,5", "5,6", "6,5"],
        "danger_cracks": ["10,10"]
    }
    response = client.post("/api/calculate-path", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["waypoints"]) > 0
    assert data["confidence"] > 0
    assert "inference_ms" in data["metrics"]

def test_pathfinding_impossible_route():
    """Edge Case: Test when the robot is completely boxed in by debris"""
    payload = {
        "cols": 10, "rows": 10,
        "robot_x": 1, "robot_y": 1,
        "target_x": 8, "target_y": 8,
        # Completely surround the robot
        "obstacles": ["0,1", "1,0", "2,1", "1,2", "0,2", "2,0", "2,2"],
        "danger_cracks": []
    }
    response = client.post("/api/calculate-path", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "failed"
    assert "No safe path" in data["message"]
