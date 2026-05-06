import assert from "node:assert/strict";
import { pointInCenteredHitbox } from "../src/renderer/src/petHitbox";

const rect = {
  left: 10,
  top: 20,
  width: 100,
  height: 200
};

export const tests = [
  {
    name: "pointInCenteredHitbox accepts points inside the centered 80 percent area",
    run(): void {
      assert.equal(pointInCenteredHitbox({ x: 20, y: 40 }, rect), true);
      assert.equal(pointInCenteredHitbox({ x: 100, y: 200 }, rect), true);
    }
  },
  {
    name: "pointInCenteredHitbox rejects points in the pet asset margin",
    run(): void {
      assert.equal(pointInCenteredHitbox({ x: 19, y: 40 }, rect), false);
      assert.equal(pointInCenteredHitbox({ x: 20, y: 39 }, rect), false);
      assert.equal(pointInCenteredHitbox({ x: 101, y: 200 }, rect), false);
      assert.equal(pointInCenteredHitbox({ x: 100, y: 201 }, rect), false);
    }
  },
  {
    name: "pointInCenteredHitbox rejects invalid geometry",
    run(): void {
      assert.equal(pointInCenteredHitbox({ x: 10, y: 10 }, { ...rect, width: 0 }), false);
      assert.equal(pointInCenteredHitbox({ x: 10, y: 10 }, rect, 1.1), false);
    }
  }
];
