import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, tick, stats, changeClass, spawnEnemy, receiveItem, upgradeGear, enterBoss, serialize, restore, settleRealTime, preferBeast, upgradeBeast, feedBeast, beastStats, beastReady, beastUpgradeCost, bossFeedCost, contractChance, STEP_MS, SUMMON_MS, BEAST_REVIVE_MS, MAX_OFFLINE_MS, ZONES } from '../src/engine.js';

function tamer() {
  const s = newGame(1000);
  assert.equal(changeClass(s, 'tamer').ok, true);
  spawnEnemy(s);
  advance(s, s.lastTick + SUMMON_MS);
  assert.equal(s.activeBeast, 'mushroom');
  return s;
}
function addCompanion(s, id, growth = 0) {
  s.beasts[id] = { id, hp: 1, rank: 0, growth, crystals: 0, reviveAt: 0 };
  s.beasts[id].hp = beastStats(s, id).maxHp;
  return s.beasts[id];
}
function killEnemy(s, id = 'mushroom', boss = false) {
  s.enemy = { id, hp: 1, maxHp: 1, attack: 1, boss };
  s.phase = 'hero'; s.heroCooldown = 0; s.enemyCooldown = STEP_MS * 2; s.inBoss = boss;
  tick(s);
  assert.equal(s.enemy.hp, 0);
}
function knockOut(s, id = s.activeBeast) {
  s.beasts[id].hp = 1;
  s.enemy.hp = s.enemy.maxHp = 1000000; s.enemy.attack = 10000;
  s.enemyCooldown = 0; s.heroCooldown = STEP_MS * 2;
  tick(s);
}

test('tamer starts with one companion, uses no weapon and preserves weapons through class changes', () => {
  const s = newGame(1000);
  const weapon = { id: s.nextItemId++, slot: 'weapon', level: 10, quality: 3, affix: 1, bossZone: -1, count: 1, locked: true };
  receiveItem(s, weapon); s.gear.weapon = 10;
  assert.equal(changeClass(s, 'tamer').ok, true);
  assert.equal(s.equipped.weapon, null);
  assert.equal(s.professions.knight.equipped.weapon.id, weapon.id);
  assert.equal(s.professions.knight.gear.weapon, 10);
  assert.equal(s.warehouse.length, 0);
  const st = stats(s); s.gear.weapon = 0;
  assert.deepEqual(stats(s), st);
  assert.equal(upgradeGear(s, 'weapon').ok, false);
  assert.equal(s.activeBeast, null);
  assert.equal(s.summonCooldown, SUMMON_MS);
  const beast = s.beasts.mushroom; beast.hp = 10;
  const better = { ...weapon, id: s.nextItemId++, level: 20 };
  assert.equal(receiveItem(s, better), false);
  assert.equal(s.equipped.weapon, null);
  changeClass(s, 'knight');
  assert.equal(s.equipped.weapon.level, 10);
  assert.equal(s.gear.weapon, 10);
  assert.ok(s.warehouse.some(item => item.id === better.id));
  changeClass(s, 'tamer');
  assert.equal(s.beasts.mushroom.hp, 10);
  assert.equal(s.beasts.mushroom.crystals, 0);
  assert.equal(Object.keys(s.beasts).length, 1);
  assert.ok(restore(serialize(s), s.lastTick));
});

test('summoning leaves the hero exposed and companions replace hero attacks and take enemy damage first', () => {
  const s = newGame(1000); changeClass(s, 'tamer'); spawnEnemy(s);
  const enemyHp = s.enemy.hp, heroHp = s.hp;
  advance(s, 1000 + STEP_MS * 2);
  assert.equal(s.enemy.hp, enemyHp, 'no unarmed hero attacks while summoning');
  assert.ok(s.hp < heroHp);
  advance(s, 1000 + SUMMON_MS);
  assert.equal(s.activeBeast, 'mushroom');
  s.heroCooldown = STEP_MS * 2; s.enemyCooldown = 0;
  const protectedHp = s.hp, petHp = s.beasts.mushroom.hp;
  tick(s);
  assert.equal(s.hp, protectedHp);
  assert.ok(s.beasts.mushroom.hp < petHp);
  tick(s);
  assert.ok(s.enemy.hp < enemyHp, 'summoned beast attacks');
});

test('fallen beasts do not pass excess damage to the hero; replacement has a vulnerable summoning gap', () => {
  const s = tamer(); addCompanion(s, 'slime');
  const hp = s.hp;
  knockOut(s);
  assert.equal(s.hp, hp);
  assert.equal(s.activeBeast, null);
  assert.equal(s.beasts.mushroom.reviveAt, s.lastTick + BEAST_REVIVE_MS);
  assert.equal(s.beasts.mushroom.hp, 0);
  s.enemy.attack = 10;
  tick(s);
  assert.ok(s.hp < hp, 'enemy attacks the summoner during replacement');
  assert.equal(s.activeBeast, null);
  tick(s);
  assert.equal(s.activeBeast, 'slime');
  assert.equal(s.beasts.mushroom.hp, 0);
});

test('preferred companions are used on the next summon and resting beasts and immature babies are skipped', () => {
  const s = tamer(); addCompanion(s, 'slime'); addCompanion(s, 'mushroomKing');
  assert.equal(preferBeast(s, 'unknown').ok, false);
  assert.equal(preferBeast(s, 'mushroomKing').ok, true);
  assert.equal(s.activeBeast, 'mushroom', 'changing priority never cancels an active summon');
  knockOut(s); s.enemy.attack = 1; tick(s); tick(s);
  assert.equal(s.activeBeast, 'slime');
  knockOut(s); s.enemy.attack = 1; tick(s); tick(s);
  assert.equal(s.activeBeast, null);
  assert.equal(s.summonCooldown, 0);
  assert.equal(beastReady(s.beasts.mushroomKing), false);
});

test('one-hour recovery is exact across speed, pause, reload, repeated settlement and an absence over the offline cap', () => {
  for (const speed of [1, 2]) {
    const s = tamer(); s.speed = speed;
    knockOut(s); const deadline = s.beasts.mushroom.reviveAt;
    s.running = false;
    advance(s, deadline - 1);
    const loaded = restore(serialize(s), deadline - 1);
    assert.ok(loaded);
    assert.equal(loaded.beasts.mushroom.hp, 0);
    assert.equal(loaded.beasts.mushroom.reviveAt, deadline);
    advance(loaded, deadline);
    assert.equal(loaded.beasts.mushroom.reviveAt, 0);
    assert.equal(loaded.beasts.mushroom.hp, beastStats(loaded, 'mushroom').maxHp);
    assert.equal(loaded.activeBeast, null, 'paused adventure does not summon');
    const recovered = serialize(loaded);
    settleRealTime(loaded, deadline);
    assert.equal(serialize(loaded), recovered);
    const old = restore(serialize(s), deadline + MAX_OFFLINE_MS * 3);
    advance(old, deadline + MAX_OFFLINE_MS * 3);
    assert.ok(beastReady(old.beasts.mushroom));
    assert.equal(old.kills, s.kills);
  }
});

test('no available companion means no hero attacks, then recovery automatically restarts summoning', () => {
  const s = tamer(); knockOut(s); s.enemy.attack = 1; s.hp = stats(s).maxHp;
  const enemyHp = s.enemy.hp;
  for (let i = 0; i < 5; i++) tick(s);
  assert.equal(s.enemy.hp, enemyHp);
  assert.equal(s.activeBeast, null);
  const deadline = s.beasts.mushroom.reviveAt;
  s.running = false; advance(s, deadline);
  s.running = true; advance(s, deadline + SUMMON_MS);
  assert.equal(s.activeBeast, 'mushroom');
});

test('ordinary victories contract probabilistically, duplicates grant same-species crystals, other classes never contract', () => {
  let duplicates = 0, recruits = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const s = tamer(); s.seed = seed;
    assert.equal(contractChance(s), .2);
    killEnemy(s);
    duplicates += s.beasts.mushroom.crystals;
    assert.equal(Object.keys(s.beasts).length, 1);
    const fresh = tamer(); fresh.seed = seed; killEnemy(fresh, 'slime');
    if (fresh.beasts.slime) recruits++;
    const knight = newGame(1000); knight.seed = seed; killEnemy(knight, 'slime');
    assert.deepEqual(knight.beasts, {});
  }
  assert.ok(duplicates > 15 && duplicates < 80);
  assert.equal(recruits, duplicates);
});

test('all six bosses grant babies, repeated bosses grant crystals and babies require rare-material feeding before combat', () => {
  for (const [zone, data] of ZONES.entries()) {
    const s = tamer(); s.zone = s.unlockedZone = zone; s.autoTravel = false; s.bossRooms[zone] = true;
    assert.equal(enterBoss(s).ok, true);
    killEnemy(s, data.boss, true);
    const baby = s.beasts[data.boss];
    assert.equal(baby.growth, 0); assert.equal(beastReady(baby), false);
    assert.ok(s.materials[`boss${zone}`] > 0);
    killEnemy(s, data.boss, true);
    assert.equal(baby.crystals, 5);
    assert.equal(Object.keys(s.beasts).length, 2);
    for (let growth = 0; growth < 5; growth++) {
      const cost = bossFeedCost(baby.id, growth);
      const before = serialize(s);
      assert.equal(feedBeast(s, baby.id).ok, false);
      assert.equal(serialize(s), before, 'failed feeding charges nothing');
      Object.assign(s.materials, cost);
      assert.equal(feedBeast(s, baby.id).ok, true);
      for (const key of Object.keys(cost)) assert.equal(s.materials[key], 0);
      assert.equal(beastReady(baby), growth >= 2);
    }
    assert.equal(feedBeast(s, baby.id).ok, false);
    assert.equal(feedBeast(s, 'mushroom').ok, false);
    assert.equal(feedBeast(s, '__proto__').ok, false);
    assert.ok(restore(serialize(s), s.lastTick));
  }
});

test('crystal upgrades are atomic, species-specific and capped; all growth actions preserve fallen beasts deadlines', () => {
  const s = tamer(), beast = s.beasts.mushroom;
  const before = serialize(s);
  assert.equal(upgradeBeast(s, beast.id).ok, false);
  assert.equal(serialize(s), before);
  beast.crystals = 10000;
  const original = beastStats(s, beast.id);
  for (let i = 0; i < 20; i++) {
    const old = beast.crystals, cost = beastUpgradeCost(beast);
    assert.equal(upgradeBeast(s, beast.id).ok, true);
    assert.equal(beast.crystals, old - cost);
  }
  assert.ok(beastStats(s, beast.id).attack > original.attack);
  assert.equal(upgradeBeast(s, beast.id).ok, false);
  const baby = addCompanion(s, 'mushroomKing', 3); baby.crystals = 20;
  s.activeBeast = baby.id; knockOut(s);
  const deadline = baby.reviveAt;
  Object.assign(s.materials, bossFeedCost(baby.id, baby.growth));
  assert.equal(feedBeast(s, baby.id).ok, true);
  assert.equal(upgradeBeast(s, baby.id).ok, true);
  preferBeast(s, baby.id); changeClass(s, 'knight'); changeClass(s, 'tamer');
  assert.equal(baby.hp, 0); assert.equal(baby.reviveAt, deadline);
  assert.ok(restore(serialize(s), s.lastTick));
});

test('foreground and offline simulation agree through companion deaths and recoveries', () => {
  for (const speed of [1, 2]) {
    const a = tamer(), b = structuredClone(a); a.speed = b.speed = speed;
    // Force an early companion death, then expose the hero during the hour of recovery.
    knockOut(a); knockOut(b); a.enemy.attack = b.enemy.attack = 4;
    const end = a.lastTick + BEAST_REVIVE_MS * 2 + 15000;
    for (let now = a.lastTick + 250; now <= end; now += 250) advance(a, now);
    advance(a, end); advance(b, end);
    assert.deepEqual(a, b);
    assert.ok(restore(serialize(a), end));
  }
});

test('v4 saves migrate without free contracts; v6 persists pets and rejects invalid active, dead and growth states', () => {
  const old = newGame(1000); old.version = 4;
  for (const key of ['beasts','activeBeast','preferredBeast','summonCooldown','beastRevision']) delete old[key];
  const migrated = restore(serialize(old), 1000);
  assert.equal(migrated.version, 6); assert.deepEqual(migrated.beasts, {});
  const s = tamer(); assert.deepEqual(restore(serialize(s), s.lastTick), s);
  const bad = [
    x => x.beasts.mushroom.rank = -1,
    x => x.beasts.mushroom.crystals = 1.5,
    x => x.beasts.mushroom.growth = 3,
    x => x.beasts.mushroom.id = 'slime',
    x => x.beasts.mushroom.hp = 0,
    x => x.beasts.mushroom.reviveAt = x.lastTick + BEAST_REVIVE_MS,
    x => x.activeBeast = 'unknown',
    x => x.preferredBeast = '__proto__',
    x => x.summonCooldown = SUMMON_MS + 1,
    x => x.heroClass = 'knight',
    x => { addCompanion(x, 'mushroomKing'); x.activeBeast = 'mushroomKing'; },
  ];
  for (const mutate of bad) {
    const copy = structuredClone(s); mutate(copy);
    assert.equal(restore(serialize(copy), copy.lastTick), null);
  }
});

test('summoning resumes from a saved partial countdown without a free attack or summon reset', () => {
  const s = newGame(1000); changeClass(s, 'tamer');
  advance(s, s.lastTick + STEP_MS);
  assert.equal(s.summonCooldown, SUMMON_MS - STEP_MS);
  const loaded = restore(serialize(s), s.lastTick);
  advance(s, s.lastTick + STEP_MS * 3); advance(loaded, loaded.lastTick + STEP_MS * 3);
  assert.deepEqual(loaded, s);
  assert.equal(s.activeBeast, 'mushroom');
});

test('a duplicate contract cannot revive a fallen companion or change its recovery deadline', () => {
  const s = tamer(); addCompanion(s, 'slime'); knockOut(s);
  s.enemy.attack = 1; tick(s); tick(s);
  const deadline = s.beasts.mushroom.reviveAt;
  let contracted = false;
  for (let seed = 1; seed <= 100; seed++) {
    const copy = structuredClone(s); copy.seed = seed; killEnemy(copy);
    if (!copy.beasts.mushroom.crystals) continue;
    assert.equal(copy.beasts.mushroom.hp, 0);
    assert.equal(copy.beasts.mushroom.reviveAt, deadline);
    assert.equal(copy.activeBeast, 'slime'); contracted = true; break;
  }
  assert.ok(contracted);
});

test('automatic equipment replacement clamps companion health if the new item lowers maximum health', () => {
  const s = tamer();
  const item = { id: s.nextItemId++, slot: 'charm', level: 10, quality: 2, affix: 3, bossZone: -1, count: 1 };
  receiveItem(s, item);
  const oldMaxHp = beastStats(s, 'mushroom').maxHp;
  s.beasts.mushroom.hp = oldMaxHp;
  // A boss defense bonus wins the score comparison despite the lower item level.
  assert.equal(receiveItem(s, { ...item, id: s.nextItemId++, level: 6, affix: 2, bossZone: 1 }), true);
  assert.ok(beastStats(s, 'mushroom').maxHp < oldMaxHp);
  assert.equal(s.beasts.mushroom.hp, beastStats(s, 'mushroom').maxHp);
  assert.ok(restore(serialize(s), s.lastTick));
});
