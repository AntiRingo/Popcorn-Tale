import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, changeClass, spawnEnemy, tick, stats, beastStats, beastForm, beastName, beastReady, beastLevelCap, beastXpNeeded, beastAdvanceCost, feedBeast, restore, serialize, advance, settleRealTime, ZONES, STEP_MS, BEAST_REVIVE_MS, JOURNEY_MAX_TICKS, JOURNEY_MIN_TICKS } from '../src/engine.js';
import { FIELD_TASKS, fieldTaskRewards } from '../src/progression.js';

test('v6 task deadlines migrate to five minutes without resetting starts or paying completed rewards again', () => {
  for (const kind of Object.keys(FIELD_TASKS)) for (const completed of [false, true]) {
    assert.equal(FIELD_TASKS[kind].duration, 5 * 60000);
    const s = newGame(1000), start = s.lastTick;
    s.version = 6; s.running = false; s.phase = 'task';
    s.fieldTask = { kind, zone: 0, startedAt: start, finishAt: start + { quarry: 3, repair: 5, rescue: 10 }[kind] * 60000, completedAt: null };
    if (completed) settleRealTime(s, s.fieldTask.finishAt);
    const gold = s.gold, materials = structuredClone(s.materials);
    const loaded = restore(serialize(s), s.lastTick); assert.ok(loaded);
    assert.equal(loaded.fieldTask.startedAt, start);
    assert.equal(loaded.fieldTask.finishAt, completed ? s.fieldTask.finishAt : start + 5 * 60000);
    assert.deepEqual(restore(serialize(loaded), loaded.lastTick), loaded);
    advance(loaded, start + 10 * 60000);
    const rewards = completed ? { gold: 0, materials: {} } : fieldTaskRewards(s.fieldTask);
    assert.equal(loaded.gold, gold + rewards.gold);
    for (const key of Object.keys(materials)) assert.equal(loaded.materials[key], materials[key] + (rewards.materials[key] || 0));
    const settled = serialize(loaded); advance(loaded, loaded.lastTick); assert.equal(serialize(loaded), settled);
  }
});

test('exploration lasts about twenty seconds and v6 waits shorten without restarting elapsed waits', () => {
  assert.ok(JOURNEY_MIN_TICKS * STEP_MS >= 19000); assert.ok(JOURNEY_MAX_TICKS * STEP_MS <= 21000);
  for (const wait of [1, 20, 35, 65]) {
    const s = newGame(1000); s.version = 6; s.phase = 'travel'; s.wait = wait;
    const loaded = restore(serialize(s), s.lastTick); assert.ok(loaded);
    assert.equal(loaded.wait, Math.min(wait, JOURNEY_MAX_TICKS));
    assert.deepEqual(restore(serialize(loaded), s.lastTick), loaded);
  }
});
