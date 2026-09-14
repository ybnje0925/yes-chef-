import { strict as assert } from "node:assert";
import { test } from "node:test";
import { elapsedSeconds, newClock, togglePause } from "../src/lib/timer";
import { evaluate, recordResult, emptyStats } from "../src/lib/scoring";
import { recipes } from "../src/data/recipes";
import type { Session } from "../src/lib/types";
test("elapsed time catches up after hidden tab without interval ticks", () => {
  assert.equal(elapsedSeconds(newClock(1000), 481000), 480);
});
test("pause freezes duration and resume excludes paused wall time", () => {
  let c = togglePause(newClock(1000), 11000);
  assert.equal(elapsedSeconds(c, 61000), 10);
  c = togglePause(c, 61000);
  assert.equal(elapsedSeconds(c, 81000), 30);
});
test("grades penalize overrides, early attempts and late steps", () => {
  assert.equal(
    evaluate({ early: 0, late: 0, scolded: 0, disobedience: 0 }).grade,
    "S",
  );
  assert.equal(
    evaluate({ early: 3, late: 1, scolded: 4, disobedience: 2 }).score,
    53,
  );
  assert.equal(
    evaluate({ early: 20, late: 20, scolded: 40, disobedience: 20 }).score,
    0,
  );
});
test("all recipes have unique steps and consistent timing", () => {
  assert.equal(new Set(recipes.map((r) => r.id)).size, recipes.length);
  for (const r of recipes) {
    assert.ok(r.ingredients.length);
    assert.equal(new Set(r.steps.map((s) => s.id)).size, r.steps.length);
    for (const s of r.steps) {
      assert.ok(s.minimumDuration <= s.recommendedDuration);
      assert.ok(
        !s.maximumDuration || s.maximumDuration > s.recommendedDuration,
      );
      assert.ok(
        s.earlyWarningMessages.length &&
          s.lateWarningMessages.length &&
          s.successMessages.length,
      );
    }
  }
});
test("result writes are idempotent; demos never change records", () => {
  const s: Session = {
    id: "test",
    recipeId: "ramen",
    index: 3,
    startedAt: 0,
    clock: newClock(0),
    counters: { early: 0, late: 0, disobedience: 0, scolded: 0 },
    warned: false,
    lateWarned: false,
    timerNotified: false,
    finishedAt: 1,
    demo: false,
    pastaSeconds: 480,
  };
  const stats = recordResult(emptyStats, s);
  assert.equal(stats.count, 1);
  assert.equal(recordResult(stats, s).count, 1);
  assert.deepEqual(recordResult(emptyStats, { ...s, demo: true }), emptyStats);
});
