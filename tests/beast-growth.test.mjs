import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, changeClass, spawnEnemy, tick, stats, beastStats, beastForm, beastName, beastReady, beastLevelCap, beastXpNeeded, beastAdvanceCost, feedBeast, restore, serialize, advance, settleRealTime, ZONES, STEP_MS, BEAST_REVIVE_MS, JOURNEY_MAX_TICKS, JOURNEY_MIN_TICKS } from '../src/engine.js';
import { FIELD_TASKS, fieldTaskRewards } from '../src/progression.js';

function companion(s, id) {
  const beast = s.beasts[id] ||= { id, level: 1, xp: 0, hp: 1, growth: 0, rank: 0, crystals: 0, reviveAt: 0 };
  beast.hp = beastStats(s, id).maxHp;
  return beast;
}
function game() {
  const s = newGame(1000); changeClass(s, 'tamer'); spawnEnemy(s);
  s.activeBeast = 'mushroom'; s.summonCooldown = 0;
  return s;
}
function victory(s) {
  spawnEnemy(s); s.enemy.hp = 1; s.heroCooldown = 0; s.enemyCooldown = STEP_MS * 2; tick(s);
  assert.equal(s.enemy.hp, 0);
}

test('only the fighting companion gains battle levels, retained through saves and class changes', () => {
  const s = game(), fighter = s.beasts.mushroom, reserve = companion(s, 'herb');
  const before = beastStats(s, fighter.id);
  for (let i = 0; i < 3; i++) victory(s);
  assert.equal(fighter.level, 2); assert.equal(fighter.xp, 0);
  assert.equal(reserve.level, 1); assert.equal(reserve.xp, 0);
  assert.ok(beastStats(s, fighter.id).attack > before.attack);
  changeClass(s, 'knight'); victory(s);
  const loaded = restore(serialize(s), s.lastTick); assert.ok(loaded);
  changeClass(loaded, 'tamer');
  assert.equal(loaded.beasts.mushroom.level, 2); assert.equal(loaded.beasts.mushroom.xp, 0);
});

test('ordinary beasts and six boss species need battle levels plus materials to advance, up to level 30', () => {
  for (const id of ['mushroom', ...ZONES.map(z => z.boss)]) {
    const s = game(), beast = companion(s, id); s.activeBeast = id;
    for (let growth = 0; growth < 5; growth++) {
      const cost = beastAdvanceCost(id, growth); Object.assign(s.materials, cost);
      const before = serialize(s);
      assert.equal(feedBeast(s, id).ok, false, 'materials cannot replace battle levels');
      assert.equal(serialize(s), before);
      beast.level = beastLevelCap(beast) - 1; beast.xp = beastXpNeeded(beast.level) - 1;
      victory(s);
      assert.equal(beast.level, (growth + 1) * 5); assert.equal(beast.xp, 0);
      victory(s); assert.equal(beast.level, (growth + 1) * 5); assert.equal(beast.xp, 0);
      Object.assign(s.materials, cost);
      const key = Object.keys(cost)[0]; s.materials[key]--;
      const insufficient = serialize(s);
      assert.equal(feedBeast(s, id).ok, false); assert.equal(serialize(s), insufficient);
      s.materials[key]++;
      assert.equal(feedBeast(s, id).ok, true);
      assert.equal(beast.growth, growth + 1); assert.equal(beastLevelCap(beast), (growth + 2) * 5);
      for (const key of Object.keys(cost)) assert.equal(s.materials[key], 0);
    }
    beast.level = 29; beast.xp = beastXpNeeded(29) - 1; victory(s); victory(s);
    assert.equal(beast.level, 30); assert.equal(beast.xp, 0);
    const final = serialize(s); assert.equal(feedBeast(s, id).ok, false); assert.equal(serialize(s), final);
    assert.ok(restore(final, s.lastTick));
  }
});

test('six boss babies fight at level one and evolve their names and forms at advancement thresholds', () => {
  for (const zone of ZONES) {
    const s = game(), baby = companion(s, zone.boss); s.activeBeast = baby.id;
    const initialName = beastName(baby);
    assert.equal(beastForm(baby).id, 'baby'); assert.ok(initialName.endsWith('宝宝'));
    victory(s); assert.equal(baby.xp, 12);
    for (const form of ['young', 'young', 'mature', 'mature', 'awakened']) {
      baby.level = beastLevelCap(baby); baby.xp = 0;
      Object.assign(s.materials, beastAdvanceCost(baby.id, baby.growth));
      assert.equal(feedBeast(s, baby.id).ok, true);
      assert.equal(beastForm(baby).id, form); assert.notEqual(beastName(baby), initialName);
      assert.ok(beastReady(baby));
    }
  }
});

test('self-defense stays weak, cannot crit and grants no experience to fallen companions', () => {
  const s = game(); s.beasts.mushroom.hp = 0; s.beasts.mushroom.reviveAt = s.lastTick + BEAST_REVIVE_MS;
  s.activeBeast = null; s.level = 20; s.talents = { might: 5, precision: 5 }; s.hp = stats(s).maxHp;
  s.enemy.hp = s.enemy.maxHp = 100000; s.enemy.attack = 1; s.heroCooldown = 0; s.enemyCooldown = STEP_MS * 2;
  const before = s.enemy.hp; tick(s);
  assert.equal(s.event.selfDefense, true); assert.equal(s.event.crit, false);
  assert.ok(before - s.enemy.hp > 0); assert.ok(before - s.enemy.hp <= Math.ceil(stats(s).attack * .11));
  victory(s); assert.equal(s.beasts.mushroom.xp, 0);
});

test('v6 contracts retain growth and crystals; old recovery deadlines become ten minutes from death once', () => {
  assert.equal(BEAST_REVIVE_MS, 10 * 60000);
  for (const elapsed of [0, 5 * 60000, 15 * 60000]) {
    const s = game(), baby = companion(s, 'mushroomKing');
    baby.growth = 3; baby.rank = 2; baby.crystals = 9;
    const fallenAt = s.lastTick;
    s.beasts.mushroom.hp = 0; s.beasts.mushroom.reviveAt = fallenAt + 60 * 60000;
    s.activeBeast = null; s.version = 6; s.running = false;
    for (const beast of Object.values(s.beasts)) { delete beast.level; delete beast.xp; }
    s.lastTick += elapsed;
    const loaded = restore(serialize(s), s.lastTick); assert.ok(loaded);
    assert.equal(loaded.version, 7); assert.equal(loaded.beasts.mushroom.reviveAt, fallenAt + 10 * 60000);
    assert.equal(loaded.beasts.mushroomKing.growth, 3); assert.equal(loaded.beasts.mushroomKing.rank, 2);
    assert.equal(loaded.beasts.mushroomKing.crystals, 9); assert.equal(loaded.beasts.mushroomKing.level, 1);
    assert.deepEqual(restore(serialize(loaded), loaded.lastTick), loaded);
    advance(loaded, Math.max(loaded.lastTick, fallenAt + 10 * 60000));
    assert.equal(loaded.beasts.mushroom.reviveAt, 0); assert.ok(beastReady(loaded.beasts.mushroom));
  }
});

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
