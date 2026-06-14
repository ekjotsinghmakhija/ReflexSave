import { describe, it, expect } from "vitest";
import { World } from "../lib/simulation/world";

describe("World Grid Engine Validation", () => {
  it("should initialize the grid with correct dimensions", () => {
    const world = new World(56, 42);
    expect(world.cols).toBe(56);
    expect(world.rows).toBe(42);
    // Ensure rows array is generated correctly
    expect(world.tiles.length).toBe(42);
    expect(world.tiles[0].length).toBe(56);
  });

  it("should prevent robots from escaping the simulation boundaries", () => {
    const world = new World(56, 42);

    // Attempt to move way off the top-left edge
    const clampedLeft = world.clampToBounds(-100, -50);
    expect(clampedLeft.x).toBe(0.5);
    expect(clampedLeft.y).toBe(0.5);

    // Attempt to move way off the bottom-right edge
    const clampedRight = world.clampToBounds(1000, 1000);
    expect(clampedRight.x).toBe(55.5); // 56 - 0.5
    expect(clampedRight.y).toBe(41.5); // 42 - 0.5
  });

  it("should accurately detect dynamic obstacles (God Mode testing)", () => {
    const world = new World(20, 20);

    // Inject a dynamic obstacle manually
    world.avoidableObstacles.add("10,10");

    // The cell itself should not be walkable
    expect(world.isWalkable(10.1, 10.1)).toBe(false);

    // An adjacent cell should still be walkable
    expect(world.isWalkable(11.5, 11.5)).toBe(true);
  });

  it("should find the nearest safe tile when spawning in danger", () => {
    const world = new World(10, 10);

    // Block out a 3x3 area
    for (let y = 1; y <= 3; y++) {
      for (let x = 1; x <= 3; x++) {
        world.avoidableObstacles.add(`${x},${y}`);
      }
    }

    // If a robot ends up at 2,2 (middle of the block), it should seek safety
    const safeCell = world.findNearestWalkableCell(2, 2);

    // It should push the robot out of the 1-3 range
    const isOutsideBlock =
      safeCell.x < 1 || safeCell.x > 3 || safeCell.y < 1 || safeCell.y > 3;
    expect(isOutsideBlock).toBe(true);
  });
});
