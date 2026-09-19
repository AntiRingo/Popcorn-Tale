import { addPet } from './pet-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, stats, advance, tick, spawnEnemy, changeClass, classProgress, highestLevel, receiveItem, equipWarehouseItem, unequipItem, upgradeGear, upgradeTalent, gearMaterialCost, xpNeeded, restore, serialize, beastStats, travel, enterBoss, settleRealTime, placeOrder, STEP_MS, MAX_OFFLINE_MS, JOURNEY_MIN_TICKS, JOURNEY_MAX_TICKS } from '../src/engine.js';
import { FIELD_TASKS, fieldTaskRewards, FLYER_REFRESH_MS, DEFAULT_SALVAGE_RULE } from '../src/progression.js';

const item = (s, options = {}) => ({ id: s.nextItemId++, slot: 'weapon', level: 10, quality: 2, affix: 0, bossZone: -1, count: 1, ...options });
function taskGame(kind = 'quarry') {
  const seeds = { quarry: 1981, repair: 1980, rescue: 1992 };
  const s = newGame(1000); s.phase = 'travel'; s.wait = 1; s.seed = seeds[kind];
  s.lastTick += STEP_MS; tick(s);
  assert.equal(s.phase, 'task'); assert.equal(s.fieldTask.kind, kind);
  return s;
}

test('professions keep independent level, experience, talents, equipment and enhancements while sharing resources', () => {
  const s = newGame(1000); s.level = 12; s.xp = 89; s.hp = stats(s).maxHp;
  s.gold = 100000; s.materials.ore = s.materials.thread = 1000;
  s.recipes.butter = 2; s.blueprints = ['craft-weapon'];
  const weapon = item(s); receiveItem(s, weapon);
  assert.equal(upgradeGear(s, 'weapon').ok, true);
  assert.equal(upgradeTalent(s, 'might').ok, true);
  const knight = structuredClone(classProgress(s, 'knight'));
  assert.equal(changeClass(s, 'ranger').ok, true);
  assert.equal(s.level, 1); assert.equal(s.xp, 0); assert.deepEqual(s.talents, {});
  assert.ok(Object.values(s.equipped).every(x => x === null));
  assert.ok(Object.values(s.gear).every(x => x === 0));
  assert.equal(s.recipes.butter, 2); assert.deepEqual(s.blueprints, ['craft-weapon']);
  const rangerWeapon = item(s, { level: 2 }); receiveItem(s, rangerWeapon);
  s.xp = 8; upgradeTalent(s, 'haste');
  const gold = s.gold, ranger = structuredClone(classProgress(s, 'ranger'));
  assert.equal(changeClass(s, 'knight').ok, true);
  assert.deepEqual(classProgress(s, 'knight'), knight); assert.equal(s.gold, gold);
  assert.deepEqual(classProgress(s, 'ranger'), ranger);
  assert.equal(s.equipped.weapon.id, weapon.id);
  assert.equal(s.warehouse.length, 0, 'other professions keep their equipped items');
  assert.deepEqual(restore(serialize(s), s.lastTick), s);
  changeClass(s, 'ranger');
  assert.deepEqual(classProgress(s, 'ranger'), ranger);
  assert.equal(highestLevel(s), 12);
  assert.equal(changeClass(s, 'cleric').ok, true, 'unlocks remain available from the best profession');
  assert.equal(s.level, 1);
});

test('battle experience belongs only to the active profession and switching retreats from a boss', () => {
  const s = newGame(1000); s.level = 12; s.zone = s.unlockedZone = 3;
  s.bossRooms[3] = true; enterBoss(s, 3);
  changeClass(s, 'ranger');
  assert.equal(s.inBoss, false); assert.equal(s.bossRooms[3], true);
  assert.equal(s.zone, 0); assert.equal(s.phase, 'travel'); assert.ok(s.wait >= JOURNEY_MIN_TICKS);
  spawnEnemy(s); s.enemy.hp = 1; s.heroCooldown = 0; s.enemyCooldown = STEP_MS * 2; tick(s);
  assert.ok(s.xp > 0); assert.equal(s.professions.knight.xp, 0);
  assert.equal(s.professions.knight.level, 12);
});

test('shared warehouse transfers physical equipment without duplicating items or transferring slot enhancement', () => {
  const s = newGame(1000); s.level = 4; s.gear.weapon = 7;
  const weapon = item(s, { locked: true }); receiveItem(s, weapon);
  assert.equal(unequipItem(s, 'weapon').ok, true);
  assert.equal(s.warehouse.length, 1); assert.equal(s.equipped.weapon, null); assert.equal(s.gear.weapon, 7);
  changeClass(s, 'ranger');
  assert.equal(equipWarehouseItem(s, weapon.id).ok, true);
  assert.equal(s.equipped.weapon.id, weapon.id); assert.equal(s.equipped.weapon.locked, true);
  assert.equal(s.gear.weapon, 0); assert.equal(s.warehouse.length, 0);
  assert.equal(equipWarehouseItem(s, weapon.id).ok, false);
  changeClass(s, 'knight');
  assert.equal(s.equipped.weapon, null); assert.equal(s.gear.weapon, 7);
  assert.equal(s.professions.ranger.equipped.weapon.id, weapon.id);
  assert.ok(restore(serialize(s), s.lastTick));
});

test('equipping a warehouse stack consumes one copy and does not auto-salvage the displaced item', () => {
  const s = newGame(1000); const old = item(s, { level: 1 }); receiveItem(s, old);
  const stack = item(s, { count: 3, locked: true }); s.warehouse.push(stack);
  s.autoSalvage = { ...DEFAULT_SALVAGE_RULE, enabled: true, slots: ['weapon'], maxQuality: 4, maxLevel: 100 };
  equipWarehouseItem(s, stack.id);
  assert.equal(stack.count, 2); assert.equal(s.equipped.weapon.count, 1);
  assert.notEqual(s.equipped.weapon.id, stack.id);
  assert.ok(s.warehouse.some(x => x.id === old.id)); assert.equal(s.salvaged, 0);
  assert.ok(restore(serialize(s), s.lastTick));
  unequipItem(s, 'weapon'); assert.equal(stack.count, 3);
  changeClass(s, 'tamer');
  assert.equal(equipWarehouseItem(s, stack.id).ok, true);
  assert.equal(s.equipped.weapon.count, 1); assert.equal(stack.count, 2);
});

test('pet base growth is independent of profession level and ordinary equipment', () => {
  const s = newGame(1000); s.level = 12;
  changeClass(s, 'tamer');
  const pet = addPet(s, 'mushroom', 'mushroom');
  const base = beastStats(s, 'mushroom');
  assert.deepEqual({ attack: base.attack, maxHp: base.maxHp, defense: base.defense }, { attack: 11, maxHp: 95, defense: 5 });
  s.level = 3; s.talents = { might: 2 };
  const grown = beastStats(s, 'mushroom'), hp = s.beasts.mushroom.hp;
  changeClass(s, 'knight'); s.level = 20; s.gear.charm = 10;
  assert.deepEqual(beastStats(s, 'mushroom'), grown); assert.equal(s.beasts.mushroom.hp, hp);
  assert.ok(restore(serialize(s), s.lastTick));
});

test('v5 migration assigns old progression to the active profession, retains pets and safely clamps their lowered health', () => {
  const s = newGame(1000); changeClass(s, 'tamer');
  addPet(s, 'mushroom', 'mushroom');
  s.version = 5; delete s.professions; delete s.fieldTask;
  s.level = 12; s.xp = 200; s.talents = { might: 3 }; s.gear.shield = 5;
  s.beasts.mushroom.hp = 100000; s.beasts.mushroom.rank = 2; s.beasts.mushroom.crystals = 17;
  const loaded = restore(serialize(s), 1000);
  assert.ok(loaded); assert.equal(loaded.version, 9); assert.equal(loaded.level, 12);
  assert.equal(loaded.xp, 200); assert.equal(loaded.gear.shield, 5); assert.equal(loaded.talents.might, 3);
  assert.equal(loaded.beasts.mushroom.hp, beastStats(loaded, 'mushroom').maxHp);
  assert.equal(loaded.beasts.mushroom.crystals, 17); assert.equal(loaded.beasts.mushroom.rank, 2);
  changeClass(loaded, 'knight'); assert.equal(loaded.level, 1); assert.equal(loaded.xp, 0);
  changeClass(loaded, 'tamer'); assert.equal(loaded.level, 12); assert.equal(loaded.gear.shield, 5);
});

test('inactive profession saves reject duplicate equipment, invalid points and injected state fields', () => {
  const s = newGame(1000); s.level = 12; receiveItem(s, item(s)); changeClass(s, 'ranger');
  const mutations = [
    x => x.warehouse.push({ ...x.professions.knight.equipped.weapon }),
    x => x.professions.knight.level = 0,
    x => x.professions.knight.xp = xpNeeded(12),
    x => x.professions.knight.gear.weapon = 101,
    x => x.professions.knight.hp = 9999999,
    x => x.professions.knight.talents = { might: 5, precision: 5, siphon: 5 },
    x => x.professions.knight.gold = 9999999,
    x => x.professions.ranger = structuredClone(x.professions.knight),
    x => x.professions.knight.equipped.weapon.id = x.nextItemId,
  ];
  for (const mutate of mutations) { const copy = structuredClone(s); mutate(copy); assert.equal(restore(serialize(copy), copy.lastTick), null); }
});

test('paid orders and fixed flyer levels survive switching to a lower level profession', () => {
  const s = newGame(1000); s.level = 12; s.gold = 10000;
  s.flyer = { id: s.nextFlyerId++, zone: 0, level: 12, purchased: [], refreshAt: 1000 + FLYER_REFRESH_MS };
  assert.equal(placeOrder(s, s.flyer.id, 'accessory', 1000).ok, true);
  changeClass(s, 'tamer'); assert.equal(s.level, 1); s.running = false;
  const loaded = restore(serialize(s), 1000); assert.ok(loaded);
  advance(loaded, loaded.orders[0].deliverAt);
  assert.ok(Object.values(loaded.equipped).some(x => x?.level === 12));
  assert.equal(loaded.professions.knight.level, 12); assert.ok(restore(serialize(loaded), loaded.lastTick));
});

test('all three field tasks occupy real time and deliver exactly once at their deadlines at either speed or while paused', () => {
  for (const kind of Object.keys(FIELD_TASKS)) for (const speed of [1, 2]) for (const running of [true, false]) {
    const s = taskGame(kind); s.speed = speed; s.running = running;
    const deadline = s.fieldTask.finishAt, rewards = fieldTaskRewards(s.fieldTask), original = structuredClone(s.materials), gold = s.gold;
    assert.equal(deadline - s.fieldTask.startedAt, FIELD_TASKS[kind].duration);
    assert.equal(travel(s, 0).ok, false); s.bossRooms[0] = true; assert.equal(enterBoss(s).ok, false);
    advance(s, deadline - 1); assert.equal(s.phase, 'task'); assert.equal(s.kills, 0);
    assert.deepEqual(s.materials, original); assert.equal(s.gold, gold);
    const loaded = restore(serialize(s), deadline - 1); assert.ok(loaded);
    advance(loaded, deadline);
    assert.equal(loaded.phase, 'travel'); assert.equal(loaded.fieldTask.completedAt, deadline);
    assert.ok(loaded.wait >= JOURNEY_MIN_TICKS && loaded.wait <= JOURNEY_MAX_TICKS);
    for (const [id, amount] of Object.entries(rewards.materials)) assert.equal(loaded.materials[id], original[id] + amount);
    assert.equal(loaded.gold, gold + rewards.gold); assert.equal(loaded.kills, 0);
    assert.equal(loaded.running, running);
    const settled = serialize(loaded); settleRealTime(loaded, deadline); assert.equal(serialize(loaded), settled);
    assert.ok(restore(settled, deadline));
  }
});

test('switching professions and gameplay speed never cancels or shortens a real-time task', () => {
  const s = taskGame('repair'); s.level = 12;
  const task = structuredClone(s.fieldTask);
  changeClass(s, 'tamer'); s.speed = 2;
  assert.deepEqual(s.fieldTask, task); assert.equal(s.phase, 'task'); assert.equal(s.level, 1);
  advance(s, task.finishAt - 1); assert.equal(s.phase, 'task');
  changeClass(s, 'mage'); assert.equal(s.phase, 'task');
  assert.ok(restore(serialize(s), s.lastTick));
  advance(s, task.finishAt); assert.equal(s.phase, 'travel');
  assert.equal(s.fieldTask.completedAt, task.finishAt);
});

test('real-time tasks and parcel deliveries settle past the offline cap without replay or combat rewards while paused', () => {
  const s = taskGame('rescue'); s.running = false;
  s.flyer = { id: s.nextFlyerId++, level: 1, zone: 0, purchased: [], refreshAt: s.lastTick + FLYER_REFRESH_MS };
  s.gold = 10000; placeOrder(s, s.flyer.id, 'ore', s.lastTick);
  const target = s.lastTick + MAX_OFFLINE_MS * 3;
  advance(s, target);
  assert.equal(s.materials.essence, 2); assert.equal(s.materials.thread, 4); assert.equal(s.materials.ore, 6);
  assert.equal(s.kills, 0); assert.equal(s.xp, 0); assert.equal(s.phase, 'travel');
  const saved = serialize(s), loaded = restore(saved, target);
  advance(loaded, target); assert.deepEqual(loaded, s);
});

test('foreground and offline simulation agree through field task completion and later encounters', () => {
  for (const speed of [1, 2]) {
    const a = taskGame('rescue'); a.speed = speed; const b = structuredClone(a);
    const end = a.lastTick + 6 * 3600000;
    for (let now = a.lastTick + 250; now < end; now += 250) advance(a, now);
    advance(a, end); advance(b, end);
    assert.deepEqual(a, b); assert.ok(a.kills > 0); assert.ok(restore(serialize(a), end));
  }
});

test('task save validation rejects shortened deadlines and mismatched completion or phase', () => {
  const s = taskGame();
  const mutations = [
    x => x.fieldTask.kind = 'unknown',
    x => x.fieldTask.finishAt--,
    x => x.fieldTask.startedAt = -1,
    x => x.fieldTask.zone = 8,
    x => x.fieldTask.completedAt = x.fieldTask.finishAt - 1,
    x => x.fieldTask.completedAt = x.fieldTask.finishAt,
    x => x.phase = 'travel',
    x => x.fieldTask = null,
  ];
  for (const mutate of mutations) { const copy = structuredClone(s); mutate(copy); assert.equal(restore(serialize(copy), copy.lastTick), null); }
});
